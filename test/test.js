var fs = require("fs");
var path = require("path");
var frequencyMangle = require("./../index");

var runTest = function (filename) {
    var sourcePath = path.resolve(__dirname, "src", filename);
    var buildPath = path.resolve(__dirname, "build", filename);

    var raw = fs.readFileSync(sourcePath, "utf8");

    frequencyMangle.mangleFile(sourcePath, {
        encoding: "utf8"
    }, {
        UglifyJS: {
            compress: {
                dead_code: true,
                global_defs: {
                    DEBUG: false
                }
            }
        },
        info: true,
        ignorePropertyKey: true
    }).then(function (content) {

        fs.writeFileSync(buildPath, content, "utf8");
        console.log(filename + ":\t" + raw.length + " -> " + content.length + "\t" + (100 * content.length / raw.length).toFixed(2) + "%.");
    });
};

runTest("jquery-3.1.1.min.js");
runTest("react-with-addons.min.js");