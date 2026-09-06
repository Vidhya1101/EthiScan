document.addEventListener("DOMContentLoaded", () => {
    initializeAuthForms();
    initializePasswordRecovery();
});

const API_BASE = "https://ethiscan-dz9i.onrender.com";

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("loginEmail").value,
                        password: document.getElementById("loginPassword").value
                    })
                });
                const data = await response.json();
                if (!response.ok || !data.token) {
                    alert(data.message || "Authentication rejected.");
                    return;
                }
                localStorage.setItem("ethiscan_token", data.token);
                localStorage.setItem("ethiscan_user", JSON.stringify(data.user));
                localStorage.removeItem("ethiscan_guest_history");
                window.location.href = "index.html";
            } catch (error) {
                console.error("Login error:", error);
                alert("Unable to connect to the server.");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async event => {
            event.preventDefault();
            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: document.getElementById("regName").value,
                        email: document.getElementById("regEmail").value,
                        password: document.getElementById("regPassword").value
                    })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    alert(data.message || "Registration failed.");
                    return;
                }
                alert("Account created successfully. Please login.");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Registration error:", error);
                alert("Unable to connect to the server.");
            }
        });
    }
}

function initializePasswordRecovery() {
    const forgotForm = document.getElementById("forgotPasswordForm");
    const resetForm = document.getElementById("resetPasswordForm");

    if (forgotForm) {
        forgotForm.addEventListener("submit", async event => {
            event.preventDefault();
            const email = document.getElementById("forgotEmail").value.trim();
            try {
                const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    alert(data.message || "Unable to verify email.");
                    return;
                }
                sessionStorage.setItem("ethiscan_reset_token", data.resetToken);
                window.location.href = "change-password.html";
            } catch (error) {
                console.error("Forgot password error:", error);
                alert("Unable to connect to the server.");
            }
        });
    }

    if (resetForm) {
        resetForm.addEventListener("submit", async event => {
            event.preventDefault();
            const password = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            const token = sessionStorage.getItem("ethiscan_reset_token");
            if (!token) {
                alert("Your reset session has expired. Please verify your email again.");
                window.location.href = "forgot-password.html";
                return;
            }
            try {
                const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    alert(data.message || "Password change failed.");
                    return;
                }
                sessionStorage.removeItem("ethiscan_reset_token");
                alert("Password changed successfully. Please sign in.");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Reset password error:", error);
                alert("Unable to connect to the server.");
            }
        });
    }
}
