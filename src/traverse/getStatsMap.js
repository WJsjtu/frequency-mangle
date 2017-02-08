var estraverse = require("estraverse");
var Syntax = estraverse.Syntax;

/**
 *
 * @param {object} ast
 * @param {string} MAP_PREFIX
 * @param {object} options
 * @return {{statsMap: {}, identifierMap: {}}}
 */
module.exports = function (ast, MAP_PREFIX, options) {
    var statsMap = {};
    var identifierMap = {};

    estraverse.traverse(ast, {
        enter: function (node, parent) {
        },
        leave: function (node, parent) {
            if (node.type == Syntax.Identifier) {
                identifierMap[MAP_PREFIX + node.name] = true;
            } else if (node.type === Syntax.MemberExpression && node.computed === false && node.property.type === Syntax.Identifier) {
                var memberName = MAP_PREFIX + node.property.name;
                if (statsMap[memberName]) {
                    statsMap[memberName] += 1;
                } else {
                    statsMap[memberName] = 1;
                }
            } else if (node.type === Syntax.Literal && typeof node.value === "string") {
                if (node.value === "use strict" && options.ignoreUseStrict) {
                    return;
                }
                if (parent.type === Syntax.Property && parent.key === node && options.ignorePropertyKey) {
                    return;
                }
                var literalValue = MAP_PREFIX + node.value;
                if (statsMap[literalValue]) {
                    statsMap[literalValue] += 1;
                } else {
                    statsMap[literalValue] = 1;
                }
            }
        }
    });

    return {
        statsMap: statsMap,
        identifierMap: identifierMap
    };
};