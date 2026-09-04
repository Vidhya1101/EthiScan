const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ethiscan-dz9i.onrender.com";

async function loadDashboard() {
    try {
        const token = localStorage.getItem("ethiscan_token");

        const response = await fetch(`${API_BASE}/api/history`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load history");
        }

        const history = await response.json();
        const tableBody = document.getElementById("searchHistoryTableBody");

        tableBody.innerHTML = "";

        let ethical = 0;
        let warning = 0;
        let unethical = 0;

        if (history.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No search history yet.
                    </td>
                </tr>
            `;
        }

        history.forEach(item => {
            if (item.status === "ETHICAL") {
                ethical++;
            } else if (item.status === "WARNING") {
                warning++;
            } else if (item.status === "UNETHICAL") {
                unethical++;
            }

            const statusClass = item.status.toLowerCase();

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${item.query}</strong></td>
                    <td style="color: var(--text-muted); font-size: 0.9rem;">
                        ${new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${item.status}
                        </span>
                    </td>
                </tr>
            `;
        });

        const total = history.length;

        document.getElementById("totalBrands").textContent = total;
        document.getElementById("ethicalCount").textContent = ethical;
        document.getElementById("warningCount").textContent = warning;
        document.getElementById("unethicalCount").textContent = unethical;

        document.getElementById("ethicalPct").textContent = total
            ? `${Math.round((ethical / total) * 100)}% of catalog`
            : "0% of catalog";

        document.getElementById("warningPct").textContent = total
            ? `${Math.round((warning / total) * 100)}% of catalog`
            : "0% of catalog";

        document.getElementById("unethicalPct").textContent = total
            ? `${Math.round((unethical / total) * 100)}% of catalog`
            : "0% of catalog";
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

async function clearHistory() {
    const token = localStorage.getItem("ethiscan_token");

    if (!token) {
        alert("Please login to clear your search history.");
        return;
    }

    const confirmed = confirm("Are you sure you want to clear your entire search history?\n\nThis action cannot be undone.");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/history`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to clear history");
        }

        alert("Your search history has been cleared successfully.");
        loadDashboard();
    } catch (error) {
        console.error("Clear history error:", error);
        alert("Unable to clear search history. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearHistoryBtn");

    if (clearButton) {
        clearButton.addEventListener("click", clearHistory);
    }

    loadDashboard();
});