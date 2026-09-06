const API_BASE = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://ethiscan-dz9i.onrender.com";

function getGuestHistory() {
    try { return JSON.parse(sessionStorage.getItem("ethiscan_guest_history") || "[]"); }
    catch { return []; }
}

function clearGuestHistory() {
    sessionStorage.removeItem("ethiscan_guest_history");
    loadDashboard();
}

async function loadDashboard() {
    try {
        const token = localStorage.getItem("ethiscan_token");
        const history = token ? await fetchHistory(token) : getGuestHistory();
        renderHistory(history, !!token);
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

async function fetchHistory(token) {
    const response = await fetch(`${API_BASE}/api/history`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Failed to load history");
    return response.json();
}

function renderHistory(history, isLoggedIn) {
    const tableBody = document.getElementById("searchHistoryTableBody");
    tableBody.innerHTML = "";
    let ethical = 0, warning = 0, unethical = 0;

    history.forEach(item => {
        if (item.status === "ETHICAL") ethical++;
        else if (item.status === "WARNING") warning++;
        else unethical++;
        const statusClass = item.status.toLowerCase();
        const viewUrl = item.result ? `result.html?id=${encodeURIComponent(item._id)}` : `index.html?brand=${encodeURIComponent(item.query)}`;
        tableBody.innerHTML += `
            <tr>
                <td><strong>${item.query}</strong></td>
                <td style="color:var(--text-muted);font-size:.9rem;">${new Date(item.createdAt).toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                <td style="white-space:nowrap;">
                    <a href="${viewUrl}" style="margin-right:10px;text-decoration:none;">View Result</a>
                    <button class="delete-history-btn" data-id="${item._id}" type="button">Delete</button>
                </td>
            </tr>`;
    });

    if (!history.length) tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted);">No search history yet.</td></tr>`;

    tableBody.querySelectorAll(".delete-history-btn").forEach(button => {
        button.addEventListener("click", () => deleteHistoryItem(button.dataset.id, isLoggedIn));
    });

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

async function deleteHistoryItem(id, isLoggedIn) {
    if (!confirm("Delete this search result?")) return;
    if (!isLoggedIn) {
        sessionStorage.setItem("ethiscan_guest_history", JSON.stringify(getGuestHistory().filter(item => item._id !== id)));
        loadDashboard();
        return;
    }
    try {
        const token = localStorage.getItem("ethiscan_token");
        const response = await fetch(`${API_BASE}/api/history/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Delete failed");
        loadDashboard();
    } catch (error) {
        console.error("Delete history error:", error);
        alert("Unable to delete this history item.");
    }
}

async function clearHistory() {
    const token = localStorage.getItem("ethiscan_token");
    if (!token) {
        if (getGuestHistory().length && confirm("Clear all guest search history?")) clearGuestHistory();
        else if (!getGuestHistory().length) alert("There is no guest history to clear.");
        return;
    }
    if (!confirm("Are you sure you want to clear your entire search history?\n\nThis action cannot be undone.")) return;
    try {
        const response = await fetch(`${API_BASE}/api/history`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to clear history");
        loadDashboard();
    } catch (error) {
        console.error("Clear history error:", error);
        alert("Unable to clear search history. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearHistoryBtn");
    if (clearButton) clearButton.addEventListener("click", clearHistory);
    loadDashboard();
});
