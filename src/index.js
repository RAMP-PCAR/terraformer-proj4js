'use strict';
function makeConverter(Terraformer, proj4) {

    return function (geojson, outputSpatialReference, inputSpatialReference) {
        let inSr = inputSpatialReference;
        let outSr = outputSpatialReference;
        const urnRegex = /urn:ogc:def:crs:EPSG::(\d+)/;

        if (!inSr && geojson.crs && geojson.crs.type === 'name') {
            const matches = geojson.crs.properties.name.match(urnRegex);
            inSr = matches ? 'EPSG:' + matches[1] : geojson.crs.properties.name;
        }

        if (!inSr) {
            inSr = 'EPSG:4326';
        } else if (!proj4.defs(inSr)) {
            throw new Error(`Projection: ${inSr} could not be found in proj4.defs`);
        }

        if (!outSr) {
            outSr = 'EPSG:4326';
            if (outSr === inSr) { return; }
        } else if (!proj4.defs(outSr)) {
            throw new Error(`Projection: ${outSr} could not be found in proj4.defs`);
        }

        const projFunc = proj4(inSr, outSr).forward;
        return Terraformer.Tools.applyConverter(geojson, projFunc);
    };
}

module.exports = makeConverter;
