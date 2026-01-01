// /js/bike_viewer/ui_buttons.js
const BV = (window.BikeViewer ||= {});

BV.updateTypeButtonHighlight = function (activeType) {
    const buttons = BV.qsa?.(".point-type-btn") ?? [];
    const active = activeType || null;

    buttons.forEach((btn) => {
        const btnType = btn.dataset.pointType;
        const labelEl = btn.querySelector(".point-type-label"); // keep btn.querySelector
        const iconEl = btn.querySelector(".point-type-icon");

        // forward icon click to button once
        if (iconEl && !iconEl.dataset._clickForwardBound) {
            iconEl.addEventListener("click", (ev) => {
                ev.stopPropagation();
                btn.click();
            });
            iconEl.dataset._clickForwardBound = "1";
        }

        const isActive = active && btnType === active;

        if (isActive) {
            btn.style.width = "100%";
            btn.style.justifyContent = "flex-start";
            btn.style.background = "var(--select-dark-50)";
            btn.style.boxShadow = "0 0 6px var(--select-dark-50)";
            btn.style.borderColor = "#00e5ff";
            if (labelEl) {
                labelEl.style.maxWidth = "200px";
                labelEl.style.opacity = "1";
                labelEl.style.marginLeft = "0.35rem";
            }
        } else {
            btn.style.width = "40px";
            btn.style.justifyContent = "center";
            btn.style.background = "";
            btn.style.boxShadow = "";
            btn.style.borderColor = "";
            if (labelEl) {
                labelEl.style.maxWidth = "0px";
                labelEl.style.opacity = "0";
                labelEl.style.marginLeft = "0";
            }
        }
    });
};

BV.updateLinkButtonHighlight = function (connectMode, activeLinkType) {
    const buttons = BV.qsa?.(".link-type-btn") ?? [];
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        const labelEl = btn.querySelector(".link-type-label"); // keep btn.querySelector
        const iconEl = btn.querySelector(".link-type-icon");
        const btnType = btn.dataset.linkType || btn.dataset.pointType;

        if (iconEl && !iconEl.dataset._clickForwardBound) {
            iconEl.addEventListener("click", (ev) => {
                ev.stopPropagation();
                btn.click();
            });
            iconEl.dataset._clickForwardBound = "1";
        }

        const isActive = !!connectMode && activeLinkType && btnType === activeLinkType;

        if (isActive) {
            btn.style.width = "100%";
            btn.style.justifyContent = "flex-start";
            btn.style.background = "var(--select-dark-50)";
            btn.style.boxShadow = "0 0 6px var(--select-dark-50)";
            btn.style.borderColor = "#00e5ff";
            if (labelEl) {
                labelEl.style.maxWidth = "200px";
                labelEl.style.opacity = "1";
                labelEl.style.marginLeft = "0.35rem";
            }
        } else {
            btn.style.width = "40px";
            btn.style.justifyContent = "center";
            btn.style.background = "";
            btn.style.boxShadow = "";
            btn.style.borderColor = "";
            if (labelEl) {
                labelEl.style.maxWidth = "0px";
                labelEl.style.opacity = "0";
                labelEl.style.marginLeft = "0";
            }
        }
    });
};

console.log("[BikeViewer] ui_buttons.js loaded");

export { };