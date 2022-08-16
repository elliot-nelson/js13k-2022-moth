// tmx-parser
//
// Very basic `.tmx` (Tiled Map) parser. A `.tmx` file is just an XML file with
// order-sensitive tags, so it's not difficult to extract information using a
// parser that supports that (such as xml2js).
//
// There are existing projects on npmjs for parsing a `.tmx` file, but I didn't
// see support for layer groups, which I'm using on this project.

const fs = require('fs');
const xml2js = require('xml2js');

/**
 * Return a value parsed as int or float, opportunistically.
 *
 * (If this becomes an issue in future, we can restrict -- or maybe allow? --
 * parsing based on key name.)
 */
function parseAsNumberIfPossible(value, key) {
    // Don't attempt to parse these tags/attributes:
    if (key === 'data' || key === 'name') return value;

    if (value.indexOf('.') >= 0) {
        let f = parseFloat(value);
        return isNaN(f) ? value : f;
    } else {
        let i = parseInt(value, 10);
        return isNaN(i) ? value : i;
    }
}

/**
 * Return parsed XML. In addition to child tags, include:
 *
 *   attributes: `.$`
 *   children: `.$$`
 *   text data: `._`
 *   node ids: `['#name']`
 */
async function tmx2xml(tmxString) {
    return await xml2js.parseStringPromise(tmxString, {
        explicitChildren: true,
        preserveChildrenOrder: true,
        valueProcessors: [parseAsNumberIfPossible],
        attrValueProcessors: [parseAsNumberIfPossible]
    });
}

/**
 * Parse a tag containing an optional <properties> tag.
 */
function collectProperties(xmlWithProps) {
    const props = {};
    if (xmlWithProps.properties) {
        for (let prop of xmlWithProps.properties[0].property) {
            props[prop.$.name] = prop.$.value;
        }
    }
    return props;
}

/**
 * Parse a tag containing a list of objects (ie an <objectgroup>).
 */
function collectObjects(objectWithObjects) {
    return objectWithObjects.$$.map(obj => ({
        ...obj.$,
        objectType: obj['#name'],
        props: collectProperties(obj)
    }));
}

/**
 * Parse the <data> object of a tile layer.
 */
function parseData(objectData) {
    // CSV format:
    //   <data> contains CSV-formatted tile data
    //   newlines at front and back need to be stripped
    //   trailing comma on each line needs to be stripped
    //   parse values as integers
    //
    // TODO: This code assumes objectData.$.encoding === 'csv' (support other formats)
    return objectData._
        .split('\n')
        .filter(row => row.length > 0)
        .map(row => row.split(',').slice(0, -1).map(value => parseInt(value, 10)));
}

/**
 * Parse a layer (i.e., a child of a <map> or <group> tag).
 */
function parseLayer(object) {
    switch (object['#name']) {
        case 'layer':
            return {
                type: 'tile',
                ...object.$,
                props: collectProperties(object),
                tiles: parseData(object.data[0])
            };
        case 'objectgroup':
            return {
                type: 'object',
                ...object.$,
                props: collectProperties(object),
                objects: collectObjects(object)
            };
        case 'group':
            return {
                type: 'group',
                ...object.$,
                props: collectProperties(object),
                layers: (object.$$ || []).map(layer => parseLayer(layer))
            };
        default:
            return { type: 'unknown' };
    }
}

/**
 * Parse the top-level <map> object.
 */
function parseMap(object) {
    return {
        ...object.$,
        layers: object.$$.map(layer => parseLayer(layer))
    };
}

async function parseTmxString(tmxString) {
    return parseMap((await tmx2xml(tmxString)).map);
}

async function parseTmxFile(tmxPath) {
    return parseTmxString(await fs.promises.readFile(tmxPath, 'utf8'));
}

module.exports = {
    parseTmxString,
    parseTmxFile
};
