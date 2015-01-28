(function (root, factory) {
  // Node.
  if(typeof module === 'object' && typeof module.exports === 'object') {
    exports = module.exports = factory(require('terraformer'), require('proj4'));
  }
  // Browser Global.
  if(typeof root.navigator === "object") {
    if (!root.Terraformer){
      throw new Error("Terraformer.Proj requires the core Terraformer library. https://github.com/esri/Terraformer");
    }
    if (!root.proj4){
      throw new Error("Terraformer.Proj requires the proj4js library. https://github.com/proj4js/proj4js");
    }
    root.Terraformer.Proj = factory(root.Terraformer, root.proj4);
  }
}(this, function(Terraformer, proj4) {

  function convert(geojson, outputSpatialReference, inputSpatialReference) {
    var inSr = inputSpatialReference,
      outSr = outputSpatialReference,
      urnRegex = /urn:ogc:def:crs:EPSG::(\d+)/,
      matches,
      projFunc;

    if (!inSr && geojson.crs && geojson.crs.type === 'name') {
      matches = geojson.crs.properties.name.match( urnRegex );
      if (matches) {
        inSr = 'EPSG:'+matches[1];
      } else {
        inSr = geojson.crs.properties.name;
      }
    }

    if (!inSr) {
      inSr = 'EPSG:4326';
    } else if (!proj4.defs(inSr)) {
      throw new Error('Projection: '+inSr+' could not be found in proj4.defs');
    }

    if (!outSr) {
      outSr = 'EPSG:4326';
      if (outSr === inSr) return;
    } else if (!proj4.defs(outSr)) {
      throw new Error('Projection: '+outSr+' could not be found in proj4.defs');
    }

    projFunc = proj4(inSr, outSr).forward;
    console.log( projFunc );

    return Terraformer.Tools.applyConverter( geojson, projFunc );
  }

  exports.convert = convert;

  return exports;
}));
