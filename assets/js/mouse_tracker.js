// assets/mouse_tracker.js
console.log("mouse_tracker.js loaded");

window.sidebarDrag = window.sidebarDrag || {
    mouseX: 0,
    mouseY: 0,
};

window.addEventListener("mousemove", function (e) {
    window.sidebarDrag.mouseX = e.clientX;
    window.sidebarDrag.mouseY = e.clientY;
});