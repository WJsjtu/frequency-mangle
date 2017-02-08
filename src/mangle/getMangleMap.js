var NameGenerator = require("./NameGenerator");

/**
 *
 * @param {array} statsArray
 * @param {object|map} identifierMap
 * @param {string} MAP_PREFIX
 * @return {object|map}
 */
module.exports = function (statsArray, identifierMap, MAP_PREFIX) {
    var mangleMap = {};
    var nameGenerator = new NameGenerator(MAP_PREFIX);

    statsArray.reverse().forEach(function (stats) {
        mangleMap[stats.key] = nameGenerator.generateNext(stats.key, identifierMap);
    });

    return mangleMap;
};