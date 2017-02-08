/**
 * Copied from https://github.com/jquery/esprima/blob/master/src/scanner.ts#L343
 * @param {string} id
 * @return {boolean}
 */
var isKeyword = function (id) {
    switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
    }
};

var firstLetter = "abcdefghijklmnopqrstuvwxyz";
firstLetter += firstLetter.toUpperCase();
firstLetter = "_$" + firstLetter;

var otherLetter = firstLetter + "0123456789";

var fl = firstLetter.length, ol = otherLetter.length;

/**
 *
 * @param {number} index
 * @return {string}
 */
var generateByIndex = function (index) {
    if (index < fl) {
        return firstLetter.charAt(index);
    } else {
        var rest = index, compare = fl, digits = 1;
        while (rest > compare) {
            rest -= compare;
            digits++;
            compare *= ol;
        }

        var block = Math.ceil(rest / fl);
        var first = firstLetter.charAt((rest - 1) % fl);

        var others = "";
        block -= 1;
        while (block) {
            others += otherLetter.charAt(block % ol);
            block = parseInt(block / ol);
        }
        return first + others;
    }
};

/**
 *
 * @param {string} prefix
 * @constructor
 */
function NameGenerator(prefix) {
    this.prefix = prefix;
    this.index = 0;
    this.map = {};
}

/**
 *
 * @param {string} name
 * @param {object|map} blackList
 * @return {string}
 */
NameGenerator.prototype.generateNext = function (name, blackList) {
    var result = generateByIndex(this.index++);
    while (isKeyword(result) || blackList[this.prefix + result] !== undefined || this.map[this.prefix + result] !== undefined) {
        result = generateByIndex(this.index++);
    }
    this.map[this.prefix + result] = "" + name;
    return result;
};

module.exports = NameGenerator;