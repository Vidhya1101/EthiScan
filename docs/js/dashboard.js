const API_BASE = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://ethiscan-1.onrender.com";

function getGuestHistory() { try { return JSON.parse(sessionStorage.getItem("ethiscan_guest_history") || "[]"); } catch { return []; } }
function getAccountHistoryKey() {
    try {
        const user = JSON.parse(localStorage.getItem("ethiscan_user") || "null");
        return user?.email ? `ethiscan_history_${user.email.trim().toLowerCase()}` : null;
    } catch { return null; }
}
function getAccountHistory() {
    const key = getAccountHistoryKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveAccountHistory(history) {
    const key = getAccountHistoryKey();
    if (key) localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value ?? ""; return div.innerHTML; }
function createClientThumbnail(result = {}) {
    const score = Math.max(0, Math.min(100, Number(result.ethicalScore) || 0));
    const accent = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><rect width="420" height="220" rx="18" fill="#0f1117"/><text x="24" y="38" fill="#7c8597" font-family="Arial" font-size="11">ETHISCAN • RESULT PREVIEW</text><text x="24" y="78" fill="white" font-family="Arial" font-size="25" font-weight="700">${escapeHtml(result.brandName || "Brand")}</text><text x="24" y="108" fill="#9ca3af" font-family="Arial" font-size="13">${escapeHtml(result.industry || "Ethical analysis")}</text><circle cx="345" cy="105" r="55" fill="#11151f" stroke="${accent}" stroke-width="6"/><text x="345" y="117" text-anchor="middle" fill="${accent}" font-family="Arial" font-size="34" font-weight="700">${score}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function ensureHistoryModal() {
    if (document.getElementById("historyPreviewModal")) return;
    const modal = document.createElement("div");
    modal.id = "historyPreviewModal";
    modal.innerHTML = `<div class="history-modal-backdrop"></div><div class="history-modal-card" role="dialog" aria-modal="true" aria-label="Previous result"><button class="history-modal-close" type="button" aria-label="Close">×</button><img id="historyModalImage" class="history-modal-image" alt="Previous result preview"><div id="historyModalInfo" class="history-modal-info"></div></div>`;
    document.body.appendChild(modal);
    const close = () => modal.classList.remove("open");
    modal.querySelector(".history-modal-backdrop").addEventListener("click", close);
    modal.querySelector(".history-modal-close").addEventListener("click", close);
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
}
function openHistoryPreview(item) {
    ensureHistoryModal();
    const modal = document.getElementById("historyPreviewModal");
    const image = document.getElementById("historyModalImage");
    const info = document.getElementById("historyModalInfo");
    const result = item.result || {};
    image.src = item.thumbnail || createClientThumbnail(result);
    image.alt = `${item.query || "Brand"} previous result`;
    info.innerHTML = `<h3>${escapeHtml(result.brandName || item.query || "Previous Result")}</h3><p><strong>Ethical Score:</strong> ${escapeHtml(result.ethicalScore ?? "N/A")}</p><p><strong>Industry:</strong> ${escapeHtml(result.industry || "General")}</p><p><strong>Sustainability:</strong> ${escapeHtml(result.sustainability || "Unknown")}</p><p>${escapeHtml(result.description || "Previous analysis result")}</p>`;
    modal.classList.add("open");
}

function renderHistory(history, isLoggedIn) {
    const tableBody = document.getElementById("searchHistoryTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    let ethical = 0, warning = 0, unethical = 0;
    history.forEach(item => {
        if (item.status === "ETHICAL") ethical++; else if (item.status === "WARNING") warning++; else unethical++;
        const id = item._id;
        const thumbnail = item.thumbnail || createClientThumbnail(item.result);
        tableBody.innerHTML += `<tr><td><strong>${escapeHtml(item.query)}</strong></td><td style="color:var(--text-muted);font-size:.9rem;">${new Date(item.createdAt).toLocaleString()}</td><td><span class="status-badge ${(item.status || "WARNING").toLowerCase()}">${escapeHtml(item.status || "WARNING")}</span></td><td><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><button class="view-info-btn" data-id="${escapeHtml(id)}" type="button">View Info</button><button class="history-image-btn" data-id="${escapeHtml(id)}" type="button" title="View previous result image"><img src="${thumbnail}" alt="${escapeHtml(item.query)} result" class="history-thumb"></button></div></td><td><button class="delete-history-btn" data-id="${escapeHtml(id)}" type="button" title="Delete history">🗑</button></td></tr>`;
    });
    if (!history.length) tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No search history yet.</td></tr>`;
    tableBody.querySelectorAll(".history-image-btn, .view-info-btn").forEach(button => button.addEventListener("click", () => { const item = history.find(entry => String(entry._id) === String(button.dataset.id)); if (item) openHistoryPreview(item); }));
    tableBody.querySelectorAll(".delete-history-btn").forEach(button => button.addEventListener("click", () => deleteHistoryItem(button.dataset.id, isLoggedIn)));
    const total = history.length;
    document.getElementById("totalBrands").textContent = total;
    document.getElementById("ethicalCount").textContent = ethical;
    document.getElementById("warningCount").textContent = warning;
    document.getElementById("unethicalCount").textContent = unethical;
    document.getElementById("ethicalPct").textContent = total ? `${Math.round(ethical / total * 100)}% of catalog` : "0% of catalog";
    document.getElementById("warningPct").textContent = total ? `${Math.round(warning / total * 100)}% of catalog` : "0% of catalog";
    document.getElementById("unethicalPct").textContent = total ? `${Math.round(unethical / total * 100)}% of catalog` : "0% of catalog";
    const clearButton = document.getElementById("clearHistoryBtn");
    if (clearButton) clearButton.textContent = isLoggedIn ? "Clear History" : "Clear Guest History";
}

async function loadDashboard() {
    const navigation = performance.getEntriesByType("navigation")[0];
    const token = localStorage.getItem("ethiscan_token");
    if (!token && navigation && navigation.type === "reload") sessionStorage.removeItem("ethiscan_guest_history");
    ensureHistoryModal();
    try {
        if (token) {
            const response = await fetch(`${API_BASE}/api/history`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to load history");
            const serverHistory = await response.json();
            const localHistory = getAccountHistory();
            renderHistory(serverHistory.length ? serverHistory : localHistory, true);
        } else renderHistory(getGuestHistory(), false);
    } catch (error) {
        console.error("Dashboard error:", error);
        renderHistory(token ? getAccountHistory() : getGuestHistory(), !!token);
    }
}

async function deleteHistoryItem(id, isLoggedIn) {
    if (!confirm("Do you want to delete this history item?")) return;
    if (!isLoggedIn) {
        const updated = getGuestHistory().filter(item => item._id !== id);
        sessionStorage.setItem("ethiscan_guest_history", JSON.stringify(updated));
        renderHistory(updated, false);
        return;
    }
    const localUpdated = getAccountHistory().filter(item => item._id !== id);
    saveAccountHistory(localUpdated);
    if (String(id).startsWith("local-")) { renderHistory(localUpdated, true); return; }
    try {
        const token = localStorage.getItem("ethiscan_token");
        const response = await fetch(`${API_BASE}/api/history/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Delete failed");
        loadDashboard();
    } catch (error) { console.error("Delete history error:", error); alert("Unable to delete this history item."); }
}

async function clearHistory() {
    const token = localStorage.getItem("ethiscan_token");
    if (!token) {
        if (!getGuestHistory().length) return;
        if (!confirm("Do you want to delete the entire guest history?")) return;
        sessionStorage.removeItem("ethiscan_guest_history");
        renderHistory([], false);
        return;
    }
    if (!confirm("Do you want to delete your entire search history? This cannot be undone.")) return;
    try {
        const response = await fetch(`${API_BASE}/api/history`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Clear failed");
        saveAccountHistory([]);
        loadDashboard();
    } catch (error) { console.error("Clear history error:", error); alert("Unable to clear search history. Please try again."); }
}

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearHistoryBtn");
    if (clearButton) clearButton.addEventListener("click", clearHistory);
    loadDashboard();
});
