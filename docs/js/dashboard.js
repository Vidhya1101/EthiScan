const DASHBOARD_API_BASE = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://ethiscan-1.onrender.com";
const HISTORY_KEY = "ethiscan_search_history";

function getStoredHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
function setStoredHistory(history) { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); }
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value ?? ""; return div.innerHTML; }
function createClientThumbnail(result = {}) {
    const score = Math.max(0, Math.min(100, Number(result.ethicalScore) || 0));
    const accent = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><rect width="420" height="220" rx="18" fill="#0f1117"/><text x="24" y="38" fill="#7c8597" font-family="Arial" font-size="11">ETHISCAN • SAVED RESULT</text><text x="24" y="78" fill="white" font-family="Arial" font-size="25" font-weight="700">${escapeHtml(result.brandName || "Brand")}</text><text x="24" y="108" fill="#9ca3af" font-family="Arial" font-size="13">${escapeHtml(result.industry || "Ethical analysis")}</text><circle cx="345" cy="105" r="55" fill="#11151f" stroke="${accent}" stroke-width="6"/><text x="345" y="117" text-anchor="middle" fill="${accent}" font-family="Arial" font-size="34" font-weight="700">${score}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function ensureHistoryModal() {
    if (document.getElementById("historyPreviewModal")) return;
    const modal = document.createElement("div");
    modal.id = "historyPreviewModal";
    modal.innerHTML = `<div class="history-modal-backdrop"></div><div class="history-modal-card" role="dialog" aria-modal="true"><button class="history-modal-close" type="button" aria-label="Close">×</button><img id="historyModalImage" class="history-modal-image" alt="Previous result"><div id="historyModalInfo" class="history-modal-info"></div></div>`;
    document.body.appendChild(modal);
    const close = () => modal.classList.remove("open");
    modal.querySelector(".history-modal-backdrop").addEventListener("click", close);
    modal.querySelector(".history-modal-close").addEventListener("click", close);
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
}
function openHistoryPreview(item) {
    ensureHistoryModal();
    const modal = document.getElementById("historyPreviewModal");
    const result = item.result || {};
    document.getElementById("historyModalImage").src = item.thumbnail || createClientThumbnail(result);
    document.getElementById("historyModalImage").alt = `${item.query || "Brand"} previous result`;
    document.getElementById("historyModalInfo").innerHTML = `<h3>${escapeHtml(result.brandName || item.query || "Previous Result")}</h3><p><strong>Ethical Score:</strong> ${escapeHtml(result.ethicalScore ?? "N/A")}</p><p><strong>Industry:</strong> ${escapeHtml(result.industry || "General")}</p><p><strong>Sustainability:</strong> ${escapeHtml(result.sustainability || "Unknown")}</p><p>${escapeHtml(result.description || "Previous analysis result")}</p><div class="history-detail-grid"><div><strong>Positive Indicators</strong><br>${escapeHtml(result.pros || "None recorded")}</div><div><strong>Ethical Concerns</strong><br>${escapeHtml(result.cons || "None recorded")}</div></div>`;
    modal.classList.add("open");
}

function renderHistory(history) {
    const tableBody = document.getElementById("searchHistoryTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    let ethical = 0, warning = 0, unethical = 0;
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    history.forEach(item => {
        if (item.status === "ETHICAL") ethical++; else if (item.status === "WARNING") warning++; else unethical++;
        const id = item._id;
        const thumbnail = item.thumbnail || createClientThumbnail(item.result);
        tableBody.innerHTML += `<tr><td class="history-brand"><strong>${escapeHtml(item.query)}</strong></td><td class="history-time">${new Date(item.createdAt).toLocaleString()}</td><td><span class="status-badge ${(item.status || "WARNING").toLowerCase()}">${escapeHtml(item.status || "WARNING")}</span></td><td><div class="previous-result-cell"><button class="view-info-btn" data-id="${escapeHtml(id)}" type="button">View Info</button><button class="history-image-btn" data-id="${escapeHtml(id)}" type="button" title="Open previous result"><img src="${thumbnail}" alt="${escapeHtml(item.query)}" class="history-thumb"></button></div></td><td class="delete-cell"><button class="delete-history-btn" data-id="${escapeHtml(id)}" type="button" title="Delete history">🗑</button></td></tr>`;
    });
    if (!history.length) tableBody.innerHTML = `<tr><td colspan="5" class="empty-history">No search history yet.</td></tr>`;
    tableBody.querySelectorAll(".history-image-btn, .view-info-btn").forEach(button => button.addEventListener("click", () => { const item = history.find(entry => String(entry._id) === String(button.dataset.id)); if (item) openHistoryPreview(item); }));
    tableBody.querySelectorAll(".delete-history-btn").forEach(button => button.addEventListener("click", () => deleteHistoryItem(button.dataset.id)));
    const total = history.length;
    document.getElementById("totalBrands").textContent = total;
    document.getElementById("ethicalCount").textContent = ethical;
    document.getElementById("warningCount").textContent = warning;
    document.getElementById("unethicalCount").textContent = unethical;
    document.getElementById("ethicalPct").textContent = total ? `${Math.round(ethical / total * 100)}% of catalog` : "0% of catalog";
    document.getElementById("warningPct").textContent = total ? `${Math.round(warning / total * 100)}% of catalog` : "0% of catalog";
    document.getElementById("unethicalPct").textContent = total ? `${Math.round(unethical / total * 100)}% of catalog` : "0% of catalog";
}

async function loadDashboard() {
    ensureHistoryModal();
    const token = localStorage.getItem("ethiscan_token");
    const localHistory = getStoredHistory();
    if (!token) { renderHistory(localHistory); return; }
    try {
        const response = await fetch(`${DASHBOARD_API_BASE}/api/history`, { headers: { Authorization: `Bearer ${token}` } });
        const serverHistory = response.ok ? await response.json() : [];
        const serverIds = new Set(serverHistory.map(item => String(item._id)));
        const merged = [...serverHistory, ...localHistory.filter(item => !serverIds.has(String(item._id)))];
        renderHistory(merged);
    } catch (error) {
        console.error("Dashboard history error:", error);
        renderHistory(localHistory);
    }
}

async function deleteHistoryItem(id) {
    if (!confirm("Do you want to delete this history item?")) return;
    const localUpdated = getStoredHistory().filter(item => String(item._id) !== String(id));
    setStoredHistory(localUpdated);
    if (!String(id).startsWith("local-")) {
        try {
            const token = localStorage.getItem("ethiscan_token");
            if (token) await fetch(`${DASHBOARD_API_BASE}/api/history/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        } catch (error) { console.error("Delete history error:", error); }
    }
    loadDashboard();
}

async function clearHistory() {
    if (!confirm("Do you want to delete your entire search history? This cannot be undone.")) return;
    setStoredHistory([]);
    const token = localStorage.getItem("ethiscan_token");
    if (token) {
        try { await fetch(`${DASHBOARD_API_BASE}/api/history`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } catch (error) { console.error("Clear history error:", error); }
    }
    renderHistory([]);
}

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearHistoryBtn");
    if (clearButton) clearButton.addEventListener("click", clearHistory);
    loadDashboard();
});
