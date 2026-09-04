document.addEventListener("DOMContentLoaded", () => {
    initializeAuthForms();
});

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const API_BASE = "https://ethiscan-dz9i.onrender.com";

    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                    headers: {
                        "Content-Type": "application/json"
                    },
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