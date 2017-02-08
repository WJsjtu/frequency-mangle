/**
 *
 * @param {object|map} mangleMap
 * @param {?function} filter
 * @return {Array.<*>}
 */
module.exports = function (mangleMap, filter) {

    var statsArray = Object.keys(mangleMap).filter(function (key) {
        return mangleMap[key] > 1;
    }).map(function (key) {
        return {
            key: key,
            count: mangleMap[key]
        };
    }).sort(function (a, b) {
        return a.count - b.count;
    });


    if (typeof filter === "function") {
        statsArray = statsArray.filter(function (stats) {
            return filter(stats.key.replace(MAP_PREFIX, ""), stats.count) !== false;
        });
    }

    return statsArray;
};