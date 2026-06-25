document.addEventListener("DOMContentLoaded", () => {
    loadHeaderModule();
});

function loadHeaderModule() {
    const headerPlaceholder = document.getElementById("header-placeholder");

    if (!headerPlaceholder) return;

    fetch("components/header.html")
        .then(res => res.text())
        .then(html => {
            headerPlaceholder.innerHTML = html;
            
            applyUserAuthStatus();
        })
        .catch(err => console.error("Header partial resolution anomaly:", err));
}

function applyUserAuthStatus() {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("ethiscan_user"));
    } catch (err) {
        localStorage.removeItem("ethiscan_user");
    }

    const currentPage = window.location.pathname;
    let activeNav = "scan";

    if (currentPage.includes("dashboard.html") || currentPage.includes("dashboard")) {
        activeNav = "dashboard";
    }

    const scanLink = document.getElementById("navScanLink");
    const dashLink = document.getElementById("navDashLink");

    if (scanLink && activeNav === "scan") scanLink.classList.add("active");
    if (dashLink && activeNav === "dashboard") dashLink.classList.add("active");

    const userSpan = document.getElementById("navUserIndicator");
    const dotIndicator = document.getElementById("navAuthDot");
    
    if (userSpan) userSpan.textContent = user?.name || "guest";
    if (dotIndicator && user) dotIndicator.classList.add("online");

    const loginBtn = document.getElementById("navLoginBtn");
    const logoutBtn = document.getElementById("navLogoutBtn");

    if (loginBtn) {
        if (user) {
            loginBtn.style.display = "none"; 
        } else {
            loginBtn.addEventListener("click", () => window.location.href = "login.html");
        }
    }

    if (logoutBtn) {
        if (!user) {
            logoutBtn.style.display = "none"; 
        } else {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("ethiscan_user");
                localStorage.removeItem("ethiscan_token");
                window.location.href = "index.html";
            });
        }
    }
}