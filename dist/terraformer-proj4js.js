"use strict";

(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }g.terraformerProj4js = f();
    }
})(function () {
    var define, module, exports;return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
                }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }return n[o].exports;
        }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
    })({ 1: [function (require, module, exports) {
            'use strict';
            function makeConverter(Terraformer, proj4) {

                // returns true if the spatial reference string is ID based and not defined in proj4
                // returns false if ID based and defined, or a different projection type (like WKT).
                // for now, we consider any projection string that begins with 'EPSG:' to be ID based
                function invalidProjID(sr) {
                    return !proj4.defs(sr) && sr.indexOf('EPSG:') === 0;
                }

                return function (geojson, outputSpatialReference, inputSpatialReference) {
                    var inSr = inputSpatialReference;
                    var outSr = outputSpatialReference;
                    var urnRegex = /urn:ogc:def:crs:EPSG::(\d+)/;

                    // no supplied input SR, but geojson has SR defined
                    if (!inSr && geojson.crs && geojson.crs.type === 'name') {
                        var matches = geojson.crs.properties.name.match(urnRegex);
                        inSr = matches ? 'EPSG:' + matches[1] : geojson.crs.properties.name;
                    }

                    if (!inSr) {
                        inSr = 'EPSG:4326';
                    } else if (invalidProjID(inSr)) {
                        throw new Error('Projection: ' + inSr + ' could not be found in proj4.defs');
                    }

                    if (!outSr) {
                        outSr = 'EPSG:4326';
                        if (outSr === inSr) {
                            return;
                        }
                    } else if (invalidProjID(outSr)) {
                        throw new Error('Projection: ' + outSr + ' could not be found in proj4.defs');
                    }

                    var projFunc = proj4(inSr, outSr).forward;
                    return Terraformer.Tools.applyConverter(geojson, projFunc);
                };
            }

            module.exports = makeConverter;
        }, {}] }, {}, [1])(1);
});