var clc = require("cli-color");
var NAME_LABEL = "frequency-mangle";

/**
 *
 * @param {string} errMsg
 * @param {string} fileName
 * @param {loc} location
 */
module.exports = function (errMsg, fileName, location) {
    console.log(
        "[" + NAME_LABEL + "]: " + clc.yellow(errMsg) + "\n" +
        "    File: " + clc.redBright(fileName || "") + "\n" +
        "    Position: " + (
            (location && location.start && location.end) ?
                clc.redBright(
                    "line: " + location.start.line + ", column: " + location.start.column +
                    " ~ " +
                    "line: " + location.end.line + ", column: " + location.end.column
                )
                : ''
        )
    );
};