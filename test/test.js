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
        /*
         * Explicitly set `ignorePropertyKey` to true is not needed.
         * Make sure your browser or minify tools support `computed property key`.
         */
        //ignorePropertyKey: true,
        ignoreUseStrict: false,
        info: true
    }).then(function (content) {

        fs.writeFileSync(buildPath, content, "utf8");
        console.log(filename + ":\t" + raw.length + " -> " + content.length + "\t" + (100 * content.length / raw.length).toFixed(2) + "%.\n");
    });
};

runTest("jquery.min.js");
runTest("react-with-addons.min.js");