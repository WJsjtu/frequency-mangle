var escodegen = require("escodegen");
var error = require("./../utils/error");

/**
 *
 * @param ast
 * @param options
 * @return {string}
 */
module.exports = function (ast, options) {
    var code;
    try {
        code = escodegen.generate(ast, options);
    } catch (e) {
        error(e.toString());
        code = false;
    }
    return code;
};