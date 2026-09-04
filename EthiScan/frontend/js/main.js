document.addEventListener("DOMContentLoaded", () => {
    loadHeaderModule();
});

function loadHeaderModule() {
    const headerPlaceholder = document.getElementById("header-placeholder");

    if (!headerPlaceholder) return;

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("ethiscan_user"));
    } catch (err) {
        localStorage.removeItem("ethiscan_user");
    }

    const currentPage = window.location.pathname;

    let activeNav = "scan";

    if (
        currentPage.includes("dashboard.html") ||
        currentPage.includes("/dashboard")
    ) {
        activeNav = "dashboard";
    }

    headerPlaceholder.innerHTML = `
        <header class="navbar">
            <div class="nav-brand">
                <div class="nav-logo-box">ES</div>
                <span>EthiScan</span>
            </div>

            <nav class="nav-links">
                <a href="/index.html" class="nav-link ${activeNav === "scan" ? "active" : ""}">
                    Scan
                </a>

                <a href="/dashboard.html" class="nav-link ${activeNav === "dashboard" ? "active" : ""}">
                    Dashboard
                </a>
            </nav>

            <div class="nav-auth-status">
                <div class="status-indicator">
                    <span class="dot ${user ? "online" : ""}"></span>
                    <span>${user?.name || "guest"}</span>
                </div>

                ${
                    user
                    ? `<button id="navLogoutBtn" class="auth-action-btn">Logout</button>`
                    : `<button id="navLoginBtn" class="auth-action-btn">Login</button>`
                }
            </div>
        </header>
    `;

    const loginBtn = document.getElementById("navLoginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            window.location.href = "/login.html";
        });
    }

    const logoutBtn = document.getElementById("navLogoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("ethiscan_user");
            localStorage.removeItem("ethiscan_token");
            window.location.href = "/index.html";
        });
    }
}