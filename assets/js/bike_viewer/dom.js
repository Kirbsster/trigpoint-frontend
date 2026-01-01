// /js/bike_viewer/dom.js
const BV = (window.BikeViewer ||= {});

BV.qs = (sel, root = document) => root.querySelector(sel);
BV.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

console.log("[BikeViewer] dom.js loaded");

export { };