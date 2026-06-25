document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        loadDashboardMetrics();
    }
    initializeAuthForms();
});

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const backendUrl = window.location.hostname.includes("localhost") 
        ? "http://localhost:5000" 
        : "https://ethiscan-dz9i.onrender.com";

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            fetch(`${backendUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: document.getElementById("loginEmail").value,
                    password: document.getElementById("loginPassword").value
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("ethiscan_token", data.token);
                    localStorage.setItem("ethiscan_user", JSON.stringify(data.user));
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Authentication rejected.");
                }
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById("regName").value,
                    email: document.getElementById("regEmail").value,
                    password: document.getElementById("regPassword").value
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Account setup complete! Please verify credentials via login.");
                    window.location.href = "login.html";
                } else {
                    alert(data.message || "Registration failed.");
                }
            });
        });
    }
}

function loadDashboardMetrics() {
    const token = localStorage.getItem("ethiscan_token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const backendUrl = "https://ethiscan-dz9i.onrender.com";

    fetch(`${backendUrl}/api/telemetry/metrics`, { headers })
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalBrandsCount").textContent = data.total || 0;
            document.getElementById("ethicalCount").textContent = data.ethical || 0;
            document.getElementById("warningCount").textContent = data.warning || 0;
            document.getElementById("unethicalCount").textContent = data.unethical || 0;

            const base = data.total || 1;
            document.getElementById("ethicalPct").textContent = `${Math.round((data.ethical/base)*100)}% of catalog`;
            document.getElementById("warningPct").textContent = `${Math.round((data.warning/base)*100)}% of catalog`;
            document.getElementById("unethicalPct").textContent = `${Math.round((data.unethical/base)*100)}% of catalog`;
        });

    fetch(`${backendUrl}/api/telemetry/history`, { headers })
        .then(res => res.json())
        .then(data => {
            const searchBody = document.getElementById("searchHistoryTableBody");
            if (searchBody && data.searches) {
                searchBody.innerHTML = data.searches.map(s => `
                    <tr>
                        <td>${s.query}</td>
                        <td>${new Date(s.timestamp).toLocaleTimeString()}</td>
                        <td><span style="color:#10b981">${s.status}</span></td>
                    </tr>
                `).join("");
            }

            const crowdBody = document.getElementById("crowdRequestsTableBody");
            if (crowdBody && data.requests) {
                crowdBody.innerHTML = data.requests.map(r => `
                    <tr>
                        <td>${r.item}</td>
                        <td>${new Date(r.timestamp).toLocaleDateString()}</td>
                        <td><span style="color:#f59e0b; font-weight:600;">${r.status.toUpperCase()}</span></td>
                    </tr>
                `).join("");
            }
        });
}