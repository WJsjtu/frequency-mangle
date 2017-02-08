var esprima = require("esprima");
var error = require("./../utils/error");

/**
 *
 * @param {string} code
 * @param {object} options
 * @return {object}
 */
module.exports = function (code, options) {
    var ast;
    try {
        ast = esprima.parse(
            code,
            options
        );
    } catch (e) {
        error(e.toString());
    }
    if (!ast) return false;
    return ast;
};