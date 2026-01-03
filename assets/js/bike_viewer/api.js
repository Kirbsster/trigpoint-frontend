// /js/bike_viewer/api.js
const BV = (window.BikeViewer ||= {});

/**
 * Resolve backend origin.
 * Priority:
 *  1) container.dataset.backendOrigin
 *  2) window.BACKEND_ORIGIN
 */
BV.getApiBase = function (container) {
    return (
        (container && container.dataset && container.dataset.backendOrigin) ||
        window.BACKEND_ORIGIN ||
        ""
    );
};

BV.getAuthHeaders = function (accessToken) {
    const h = { "Content-Type": "application/json" };
    if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
    return h;
};

BV.fetchBike = async function ({ container, bikeId, accessToken }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    const headers = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    return fetch(`${API_BASE}/bikes/${bikeId}`, {
        method: "GET",
        headers,
        credentials: "include",
    });
};

BV.fetchBodies = async function ({ container, bikeId, accessToken }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    const headers = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    return fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
        method: "GET",
        headers,
        credentials: "include",
    });
};

BV.putPoints = async function ({ container, bikeId, accessToken, pointsPayload }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    return fetch(`${API_BASE}/bikes/${bikeId}/points`, {
        method: "PUT",
        headers: BV.getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(pointsPayload),
    });
};

BV.putBodies = async function ({ container, bikeId, accessToken, payload }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    return fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
        method: "PUT",
        headers: BV.getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(payload),
    });
};

BV.putGeometry = async function ({ container, bikeId, accessToken, payload }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    return fetch(`${API_BASE}/bikes/${bikeId}/geometry`, {
        method: "PUT",
        headers: BV.getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(payload),
    });
};

BV.putHeroPerspective = async function ({ container, bikeId, accessToken, payload }) {
    const API_BASE = BV.getApiBase(container);
    if (!API_BASE) throw new Error("BACKEND_ORIGIN missing");

    return fetch(`${API_BASE}/bikes/${bikeId}/media/hero/perspective`, {
        method: "PUT",
        headers: BV.getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(payload),
    });
};

console.log("[BikeViewer] api.js loaded");

// Mark as ES module without exporting anything
export { };
