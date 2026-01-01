// /js/bike_viewer/theme.js
const BV = (window.BikeViewer ||= {});

BV.cssVar = function (name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
};

console.log("[BikeViewer] theme.js loaded");

export { };