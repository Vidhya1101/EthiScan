async function loadDashboard() {
    try {
        const token = localStorage.getItem("ethiscan_token");

        const response = await fetch("https://ethiscan-dz9i.onrender.com/api/analytics/history", {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });

        const history = await response.json();
        const tableBody = document.getElementById("searchHistoryTableBody");
        tableBody.innerHTML = "";

        let ethical = 0;
        let warning = 0;
        let unethical = 0;

        history.forEach(item => {
            if (item.statusResult === "Ethical") {
                ethical++;
            } else if (item.statusResult === "Warning") {
                warning++;
            } else if (item.statusResult === "Unethical") {
                unethical++;
            }

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${item.brandName}</strong></td>
                    <td style="color: var(--text-muted); font-size: 0.9rem;">
                        ${new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td>
                        <span class="status-badge ${item.statusResult.toLowerCase()}">
                            ${item.statusResult}
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
        console.log(error);
    }
}

loadDashboard();
