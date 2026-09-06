document.addEventListener("DOMContentLoaded", () => {
    initializeAuthForms();
    initializePasswordRecovery();
});

const API_BASE = "https://ethiscan-1.onrender.com";

function showInlineMessage(id, message, type = "success") {
    const box = document.getElementById(id);
    if (!box) return;
    box.style.display = "block";
    box.style.background = type === "success" ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)";
    box.style.border = `1px solid ${type === "success" ? "#10b981" : "#ef4444"}`;
    box.style.color = type === "success" ? "#10b981" : "#ef4444";
    box.innerHTML = message;
}

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: document.getElementById("loginEmail").value, password: document.getElementById("loginPassword").value }) });
            const data = await response.json();
            if (!response.ok || !data.token) { alert(data.message || "Authentication rejected."); return; }
            localStorage.setItem("ethiscan_token", data.token);
            localStorage.setItem("ethiscan_user", JSON.stringify(data.user));
            localStorage.removeItem("ethiscan_guest_history");
            window.location.href = "index.html";
        } catch (error) { console.error("Login error:", error); alert("Unable to connect to the server."); }
    });

    if (registerForm) registerForm.addEventListener("submit", async event => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: document.getElementById("regName").value, email: document.getElementById("regEmail").value, password: document.getElementById("regPassword").value }) });
            const data = await response.json();
            if (!response.ok || !data.success) { alert(data.message || "Registration failed."); return; }
            alert("Account created successfully. Please login.");
            window.location.href = "login.html";
        } catch (error) { console.error("Registration error:", error); alert("Unable to connect to the server."); }
    });
}

function initializePasswordRecovery() {
    const forgotForm = document.getElementById("forgotPasswordForm");
    const resetForm = document.getElementById("resetPasswordForm");

    if (forgotForm) forgotForm.addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("forgotEmail").value.trim();
        const button = forgotForm.querySelector("button[type='submit']");
        button.disabled = true;
        button.textContent = "Verifying...";
        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
            const data = await response.json();
            if (!response.ok || !data.success) { showInlineMessage("forgotMessage", data.message || "Unable to verify email.", "error"); button.disabled = false; button.textContent = "Verify Email →"; return; }
            sessionStorage.setItem("ethiscan_reset_token", data.resetToken);
            showInlineMessage("forgotMessage", "✓ Email verified successfully. <a href=\"change-password.html\" style=\"color:#10b981;font-weight:700;\">Click here to reset your password →</a>");
            button.disabled = false;
            button.textContent = "Email Verified ✓";
        } catch (error) {
            console.error("Forgot password error:", error);
            showInlineMessage("forgotMessage", "Unable to connect to the server.", "error");
            button.disabled = false;
            button.textContent = "Verify Email →";
        }
    });

    if (resetForm) resetForm.addEventListener("submit", async event => {
        event.preventDefault();
        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        if (password !== confirmPassword) { showInlineMessage("resetMessage", "Passwords do not match.", "error"); return; }
        const token = sessionStorage.getItem("ethiscan_reset_token");
        if (!token) { showInlineMessage("resetMessage", "Reset session expired. Please verify your email again.", "error"); return; }
        try {
            const response = await fetch(`${API_BASE}/api/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
            const data = await response.json();
            if (!response.ok || !data.success) { showInlineMessage("resetMessage", data.message || "Password reset failed.", "error"); return; }
            sessionStorage.removeItem("ethiscan_reset_token");
            showInlineMessage("resetMessage", "✓ Password has been reset successfully. Redirecting to Sign In...", "success");
            setTimeout(() => { window.location.href = "login.html"; }, 1800);
        } catch (error) { console.error("Reset password error:", error); showInlineMessage("resetMessage", "Unable to connect to the server.", "error"); }
    });
}
