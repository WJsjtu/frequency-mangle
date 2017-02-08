var parse = require("./../parser/parse");
var Syntax = require("estraverse").Syntax;
var error = require("./../utils/error");

/**
 *
 * @param {object} ast
 * @param {object|map} mangleMap
 * @param {string} MAP_PREFIX
 * @return {object}
 */
module.exports = function (ast, mangleMap, MAP_PREFIX) {

    var declarations = [];

    for (var key in mangleMap) {
        if (mangleMap.hasOwnProperty(key)) {
            declarations.push(
                mangleMap[key] + " = " + JSON.stringify(key.replace(MAP_PREFIX, ""))
            );
        }
    }

    var declarationCode = "!function(){\nvar " + declarations.join(",\n") + ";" + "\n}();";

    var newAst = parse(declarationCode);
    if (!newAst) return false;

    var modifyAST = false;
    if (newAst.type === Syntax.Program) {
        if (newAst.body.length === 1) {
            if (newAst.body[0].type === Syntax.ExpressionStatement) {
                if (newAst.body[0].expression.type === Syntax.UnaryExpression) {
                    var argument = newAst.body[0].expression.argument;
                    if (argument.type === Syntax.CallExpression) {
                        if (argument.callee.type === Syntax.FunctionExpression) {
                            if (argument.callee.body.type === Syntax.BlockStatement) {
                                var body = argument.callee.body.body;
                                body.push.apply(body, ast.body);
                                modifyAST = true;
                            }
                        }
                    }
                }
            }
        }
    }

    if (modifyAST) {
        return newAst;
    } else {
        error("Fail to insert declaration");
        return false;
    }
};