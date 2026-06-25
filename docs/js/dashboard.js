async function loadDashboard() {
    try {
        const token = localStorage.getItem("ethiscan_token");

        const backendUrl = window.location.hostname.includes("localhost") 
            ? "http://localhost:5000" 
            : "https://ethiscan-dz9i.onrender.com";

        const response = await fetch(`${backendUrl}/api/history`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const history = await response.json();
        const tableBody = document.getElementById("searchHistoryTableBody");
        tableBody.innerHTML = "";

        let ethical = 0;
        let warning = 0;
        let unethical = 0;

        history.forEach(item => {
            const currentStatus = item.status || "UNKNOWN";
            
            if (currentStatus === "ETHICAL") {
                ethical++;
            } else if (currentStatus === "WARNING") {
                warning++;
            } else if (currentStatus === "UNETHICAL") {
                unethical++;
            }

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${item.query || "Unknown Brand"}</strong></td>
                    <td style="color: var(--text-muted); font-size: 0.9rem;">
                        ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                    </td>
                    <td>
                        <span class="status-badge ${currentStatus.toLowerCase()}">
                            ${currentStatus}
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

loadDashboard();