'use strict';
function makeConverter(Terraformer, proj4) {

    // returns true if the spatial reference string is ID based and not defined in proj4
    // returns false if ID based and defined, or a different projection type (like WKT).
    // for now, we consider any projection string that begins with 'EPSG:' to be ID based
    function invalidProjID(sr) {
        return !proj4.defs(sr) && sr.indexOf('EPSG:') === 0;
    }

    return function (geojson, outputSpatialReference, inputSpatialReference) {
        let inSr = inputSpatialReference;
        let outSr = outputSpatialReference;
        const urnRegex = /urn:ogc:def:crs:EPSG::(\d+)/;

        // no supplied input SR, but geojson has SR defined
        if (!inSr && geojson.crs && geojson.crs.type === 'name') {
            const matches = geojson.crs.properties.name.match(urnRegex);
            inSr = matches ? 'EPSG:' + matches[1] : geojson.crs.properties.name;
        }

        if (!inSr) {
            inSr = 'EPSG:4326';
        } else if (invalidProjID(inSr)) {
            throw new Error(`Projection: ${inSr} could not be found in proj4.defs`);
        }

        if (!outSr) {
            outSr = 'EPSG:4326';
            if (outSr === inSr) { return; }
        } else if (invalidProjID(outSr)) {
            throw new Error(`Projection: ${outSr} could not be found in proj4.defs`);
        }

        const projFunc = proj4(inSr, outSr).forward;
        return Terraformer.Tools.applyConverter(geojson, projFunc);
    };
}

module.exports = makeConverter;
