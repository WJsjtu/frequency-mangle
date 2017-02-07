var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var assign = require("object-assign");
var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");

var uglifyJS = require('uglify-js');

var warning = require("./utils/warning");
var error = require("./utils/error");

var MAP_PREFIX = "MAP_";
var ES_OPTIMIZE = "ES_OPTIMIZE_";

var defaultESCodeGenOption = {comment: false};
var defaultESPrimaOption = {comment: false, attachComment: false};
var defaultOption = {
    /**
     * var b = {"default": 2}; => var a = "default"; b = {[a]: 2};
     * This may cause UglifyJS parse error if not in harmony branch.
     * https://github.com/mishoo/UglifyJS2/issues/1373
     * This is ES6 feature.
     * To use harmony branch, modify your package.json file.
     * {"uglify-js": "git+https://github.com/mishoo/UglifyJS2.git#harmony"}
     */
    ignorePropertyKey: true,
    /**
     * "use strict" is preserved by default.
     */
    ignoreUseStrict: true,
    UglifyJS: false,
    escodegen: defaultESCodeGenOption,
    esprima: defaultESPrimaOption
};

var mangle = function (code, options) {

    options = options || {};
    options = assign(defaultOption, options);

    var varDeclaredMap = {};
    var mangleMap = {};

    var ast;
    try {
        ast = esprima.parse(
            code,
            options.esprima
        );
    } catch (e) {
        error(e.toString());
    }
    if (!ast) return false;

    estraverse.traverse(ast, {
        enter: function (node, parent) {
        },
        leave: function (node, parent) {
            if (node.type == "VariableDeclarator") {
                varDeclaredMap[MAP_PREFIX + node.id.name] = true;
            } else if (node.type === "MemberExpression" && node.computed === false && node.property.type === "Identifier") {
                var memberName = MAP_PREFIX + node.property.name;
                if (mangleMap[memberName]) {
                    mangleMap[memberName] += 1;
                } else {
                    mangleMap[memberName] = 1;
                }
            } else if (node.type === "Literal" && typeof node.value === "string") {
                if (node.value === "use strict" && options.ignoreUseStrict) {
                    return;
                }
                if (parent.type === "Property" && parent.key === node && options.ignorePropertyKey) {
                    return;
                }
                var literalValue = MAP_PREFIX + node.value;
                if (mangleMap[literalValue]) {
                    mangleMap[literalValue] += 1;
                } else {
                    mangleMap[literalValue] = 1;
                }
            }
        }
    });

    var statsArray = Object.keys(mangleMap).filter(function (key) {
        return mangleMap[key] > 1;
    }).map(function (key) {
        return {
            key: key,
            count: mangleMap[key]
        };
    }).sort(function (a, b) {
        return a.count - b.count;
    });


    if (typeof options.filter === "function") {
        statsArray = statsArray.filter(function (stats) {
            return options.filter(stats.key.replace(MAP_PREFIX, ""), stats.count) !== false;
        });
    }

    var mangleList = {};

    var getReplaceName = function (name) {
        name = name.replace(MAP_PREFIX, "");
        var result = ES_OPTIMIZE + crypto.createHash("md5").update(name).digest("hex").slice(0, 4);
        var index = 0;
        while (varDeclaredMap[MAP_PREFIX + result]) {
            result = result + index;
            index++;
        }
        varDeclaredMap[MAP_PREFIX + result] = true;
        return result;
    };

    statsArray.forEach(function (stats) {
        mangleList[stats.key] = getReplaceName(stats.key);
    });

    if (options.info) {
        console.log(
            "The following identifiers or strings will be mangled:\n" +
            statsArray.map(function (stats) {
                return +stats.count + " * \t" + JSON.stringify(stats.key.replace(MAP_PREFIX, ""));
            }).join("\n") + "\n"
        );
    }


    var mangleKeys = Object.keys(mangleList);

    var newCode;

    if (mangleKeys.length) {

        ast = estraverse.replace(ast, {
            enter: function (node, parent) {
                if (node.type === "MemberExpression" && node.computed === false && node.property.type === "Identifier") {
                    var memberName = MAP_PREFIX + node.property.name;
                    if (mangleList[memberName]) {
                        node.computed = true;
                        node.property = {
                            "type": "Identifier",
                            "name": mangleList[memberName]
                        };
                    }
                } else if (node.type === "Literal" && typeof node.value === "string") {
                    var literalValue = MAP_PREFIX + node.value;
                    if (mangleList[literalValue]) {
                        if (parent.type === "Property" && parent.key === node) {
                            if (options.ignorePropertyKey) {
                                return;
                            } else {
                                parent.computed = true;
                            }
                        }
                        return {
                            "type": "Identifier",
                            "name": mangleList[literalValue]
                        };
                    }
                }
            },
            leave: function (node, parent) {

            }
        });

        try {
            newCode = escodegen.generate(ast, options.escodegen);
            newCode = "!(function(){\nvar " + mangleKeys.map(function (key) {
                    return mangleList[key] + " = " + JSON.stringify(key.replace(MAP_PREFIX, ""));
                }).reverse().join(",\n") + ";" + newCode + "\n}());";

            if (typeof options.UglifyJS === "object") {
                var result = uglifyJS.minify(
                    newCode,
                    assign({}, options.UglifyJS, {fromString: true})
                );

                if (result.code) {
                    newCode = result.code;
                } else {
                    error("cannot get compressed code!");
                }
            }

        } catch (e) {
            error(e.toString());
            newCode = false;
        }
    } else {
        //Nothing to mangle
        newCode = code;
    }

    return newCode;
};

module.exports = {
    mangle: mangle,
    mangleFile: function (path, fileOptions, options) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path, fileOptions, function (err, data) {
                if (err) {
                    warning(err.toString());
                    reject(err);
                } else {
                    var result = mangle(data, options);
                    if (result) {
                        resolve(result);
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    warning: warning,
    error: error
};