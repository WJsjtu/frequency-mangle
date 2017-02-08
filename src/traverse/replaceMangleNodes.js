var estraverse = require("estraverse");
var Syntax = estraverse.Syntax;

/**
 *
 * @param {object} ast
 * @param {object|map} mangleMap
 * @param {object} options
 * @param {string} MAP_PREFIX
 * @return {object}
 */
module.exports = function (ast, mangleMap, options, MAP_PREFIX) {
    ast = estraverse.replace(ast, {
        enter: function (node, parent) {
            if (node.type === Syntax.MemberExpression && node.computed === false && node.property.type === Syntax.Identifier) {
                var memberName = MAP_PREFIX + node.property.name;
                if (mangleMap[memberName]) {
                    node.computed = true;
                    node.property = {
                        type: Syntax.Identifier,
                        name: mangleMap[memberName]
                    };
                }
            } else if (node.type === Syntax.Literal && typeof node.value === "string") {
                var literalValue = MAP_PREFIX + node.value;
                if (mangleMap[literalValue]) {
                    if (parent.type === Syntax.Property && parent.key === node) {
                        if (options.ignorePropertyKey) {
                            return;
                        } else {
                            parent.computed = true;
                        }
                    }
                    return {
                        type: Syntax.Identifier,
                        name: mangleMap[literalValue]
                    };
                }
            }
        },
        leave: function (node, parent) {

        }
    });
    return ast;
};