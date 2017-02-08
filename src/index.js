var fs = require("fs");
var path = require("path");

var assign = require("object-assign");
var estraverse = require("estraverse");

var warning = require("./utils/warning");
var error = require("./utils/error");

var parse = require("./parser/parse");
var generate = require("./parser/generate");
var getStatsMap = require("./traverse/getStatsMap");
var replaceMangleNodes = require("./traverse/replaceMangleNodes");
var filter = require("./mangle/filter");
var getMangleMap = require("./mangle/getMangleMap");
var wrapDeclaration = require("./mangle/wrapDeclaration");

var MAP_PREFIX = "FREQUENCY_MANGLE_MAP_";

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
    minify: false,
    escodegen: defaultESCodeGenOption,
    esprima: defaultESPrimaOption
};

var mangle = function (code, options) {

    options = options || {};
    options = assign(defaultOption, options);

    var ast = parse(code, options.esprima);
    if (!ast) return false;

    var stats = getStatsMap(ast, MAP_PREFIX, options);

    var statsArray = filter(stats.statsMap, options.filter);

    if (options.info) {
        console.log(
            "The following identifiers or strings will be mangled:\n" +
            statsArray.map(function (stats) {
                return +stats.count + " * \t" + JSON.stringify(stats.key.replace(MAP_PREFIX, ""));
            }).join("\n") + "\n"
        );
    }

    var mangleMap = getMangleMap(statsArray, stats.identifierMap, MAP_PREFIX);

    if (Object.keys(mangleMap).length) {

        var newAst = wrapDeclaration(
            replaceMangleNodes(ast, mangleMap, options, MAP_PREFIX),
            mangleMap,
            MAP_PREFIX
        );

        if (!newAst) return false;

        return generate(newAst, options.minify ? {
            format: {
                renumber: true,
                hexadecimal: true,
                escapeless: true,
                compact: true,
                semicolons: false,
                parentheses: false
            }
        } : undefined);

    } else {
        //Nothing to mangle
        return code;
    }
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
    error: error,
    version: "0.0.9"
};