document.addEventListener("DOMContentLoaded", () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!localStorage.getItem("ethiscan_token") && navigation && navigation.type === "reload") sessionStorage.removeItem("ethiscan_guest_history");
    const searchPlaceholder = document.getElementById("search-placeholder");
    if (!searchPlaceholder) return;
    const BASE_PATH = window.location.hostname === "localhost" ? "" : "/EthiScan";
    fetch(`${BASE_PATH}/components/search-bar.html`).then(r => { if (!r.ok) throw new Error("Failed to load search bar"); return r.text(); }).then(html => { searchPlaceholder.innerHTML = html; initializeScannerEvents(); }).catch(error => console.error("Search bar loading error:", error));
});

function getGuestHistory() { try { return JSON.parse(sessionStorage.getItem("ethiscan_guest_history") || "[]"); } catch { return []; } }
function getCurrentUserKey() {
    try {
        const user = JSON.parse(localStorage.getItem("ethiscan_user") || "null");
        return user?.email ? `ethiscan_history_${user.email.trim().toLowerCase()}` : null;
    } catch { return null; }
}
function getAccountHistory() {
    const key = getCurrentUserKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveAccountHistory(brand) {
    const key = getCurrentUserKey();
    if (!key) return;
    const history = getAccountHistory();
    history.unshift({ _id: `local-${Date.now()}`, query: brand.brandName || "Unknown", status: Number(brand.ethicalScore) >= 70 ? "ETHICAL" : Number(brand.ethicalScore) >= 40 ? "WARNING" : "UNETHICAL", createdAt: new Date().toISOString(), result: brand, thumbnail: createGuestThumbnail(brand), localOnly: true });
    localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}
function createGuestThumbnail(brand) {
    const score = Math.max(0, Math.min(100, Number(brand.ethicalScore) || 0));
    const accent = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><rect width="420" height="220" rx="18" fill="#0f1117"/><text x="24" y="38" fill="#7c8597" font-family="Arial" font-size="11">ETHISCAN • RESULT PREVIEW</text><text x="24" y="78" fill="white" font-family="Arial" font-size="25" font-weight="700">${brand.brandName || "Brand"}</text><text x="24" y="108" fill="#9ca3af" font-family="Arial" font-size="13">${brand.industry || "Ethical analysis"}</text><circle cx="345" cy="105" r="55" fill="#11151f" stroke="${accent}" stroke-width="6"/><text x="345" y="117" text-anchor="middle" fill="${accent}" font-family="Arial" font-size="34" font-weight="700">${score}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function saveGuestHistory(brand) {
    const history = getGuestHistory();
    history.unshift({ _id: `guest-${Date.now()}`, query: brand.brandName || "Unknown", status: Number(brand.ethicalScore) >= 70 ? "ETHICAL" : Number(brand.ethicalScore) >= 40 ? "WARNING" : "UNETHICAL", createdAt: new Date().toISOString(), result: brand, thumbnail: createGuestThumbnail(brand) });
    sessionStorage.setItem("ethiscan_guest_history", JSON.stringify(history.slice(0, 50)));
}

function initializeScannerEvents() {
    const input = document.getElementById("brandSearchInput");
    const btn = document.getElementById("analyzeBtn");
    if (!input || !btn) return;
    async function executeAnalysis(queryValue) {
        const val = queryValue.trim();
        if (!val) return;
        const resPlaceholder = document.getElementById("result-placeholder");
        if (resPlaceholder) resPlaceholder.innerHTML = `<div class="result-card-container animate-fade-in" style="background:#11131c;border:1px solid #1e2230;padding:32px;border-radius:12px;margin-top:24px;text-align:center;"><div style="font-size:18px;font-weight:600;">Analyzing Brand Ethics...</div></div>`;
        try {
            const token = localStorage.getItem("ethiscan_token");
            const response = await fetch(`https://ethiscan-1.onrender.com/api/brands/${encodeURIComponent(val)}`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
            const data = await response.json();
            if (!response.ok || !data.success) { if (resPlaceholder) resPlaceholder.innerHTML = `<div style="background:#111827;border:1px solid #ef4444;padding:24px;border-radius:16px;margin-top:24px;color:white;"><h3 style="color:#ef4444;">Analysis Failed</h3><p style="color:#9ca3af;">${data.message || "Unable to analyze this brand right now."}</p></div>`; return; }
            if (token) saveAccountHistory(data.brand);
            else saveGuestHistory(data.brand);
            renderResultCard(data.brand);
        } catch (error) { console.error("Analysis error:", error); if (resPlaceholder) resPlaceholder.innerHTML = `<div class="result-card-container animate-fade-in" style="background:#11131c;border:1px solid #ef4444;padding:32px;border-radius:12px;margin-top:24px;text-align:center;"><div style="font-size:18px;font-weight:600;color:#ef4444;">Server Error</div><p style="color:#9ca3af;margin-top:10px;">Unable to connect to the EthiScan server.</p></div>`; }
    }
    btn.addEventListener("click", () => executeAnalysis(input.value));
    input.addEventListener("keypress", event => { if (event.key === "Enter") executeAnalysis(input.value); });
    document.querySelectorAll(".suggestion-tag").forEach(tag => tag.addEventListener("click", event => { input.value = event.target.textContent; executeAnalysis(event.target.textContent); }));
}

function renderResultCard(brand) {
    const resPlaceholder = document.getElementById("result-placeholder");
    if (!resPlaceholder) return;
    const score = Number(brand.ethicalScore) || 0;
    const accentColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
    resPlaceholder.innerHTML = `<div class="result-card-container animate-fade-in" style="background:#0f1117;border:1px solid #1f2430;padding:32px;border-radius:20px;margin-top:24px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:30px;flex-wrap:wrap;"><div style="flex:1;min-width:280px;"><div style="font-size:11px;color:#7c8597;letter-spacing:1px;text-transform:uppercase;">Live Ethical Analysis</div><h2 style="font-size:42px;font-weight:700;margin-top:10px;color:white;">${brand.brandName || "Unknown"}</h2><div style="margin-top:8px;color:#7c8597;font-size:14px;">Industry • ${brand.industry || "General"}</div><div style="margin-top:18px;display:inline-flex;padding:8px 14px;border-radius:999px;border:1px solid ${accentColor};color:${accentColor};font-size:13px;font-weight:600;">${brand.sustainability || "Unknown"}</div></div><div style="width:110px;height:110px;border-radius:50%;border:5px solid ${accentColor};display:flex;justify-content:center;align-items:center;font-size:38px;font-weight:700;color:${accentColor};">${score}</div></div><div style="margin-top:28px;background:#151926;border:1px solid #222838;border-radius:14px;padding:18px;color:#cbd5e1;line-height:1.8;font-size:14px;">${brand.description || "No description available."}</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;"><div style="background:#151926;border:1px solid #222838;border-radius:16px;padding:20px;"><h3 style="font-size:18px;margin-bottom:16px;color:white;">Positive Indicators</h3><div style="color:#9ca3af;line-height:1.8;font-size:14px;">${brand.pros || "No positive indicators found."}</div></div><div style="background:#151926;border:1px solid #222838;border-radius:16px;padding:20px;"><h3 style="font-size:18px;margin-bottom:16px;color:white;">Ethical Concerns</h3><div style="color:#9ca3af;line-height:1.8;font-size:14px;">${brand.cons || "No ethical concerns found."}</div></div></div>${Array.isArray(brand.smartAlternatives) && brand.smartAlternatives.length ? `<div style="margin-top:28px;"><h3 style="font-size:20px;margin-bottom:18px;color:white;">Better Ethical Alternatives</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">${brand.smartAlternatives.map(item => `<div style="background:#151926;border:1px solid #222838;border-radius:16px;padding:18px;"><div style="font-size:18px;font-weight:600;color:white;margin-bottom:10px;">${item.brandName || "Unknown"}</div><div style="color:#10b981;font-size:14px;font-weight:600;">Ethical Score • ${item.ethicalScore ?? "N/A"}</div></div>`).join("")}</div></div>` : ""}</div>`;
}
