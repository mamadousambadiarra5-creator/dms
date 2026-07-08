const API_URL = "http://localhost:3001/api";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Une erreur est survenue lors de la connexion.");
                }

                localStorage.setItem("currentUser", JSON.stringify(data));
                window.location.href = "../dashboard.html";
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;

            if (!name || !email || !phone || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Une erreur est survenue lors de l'inscription.");
                }

                localStorage.setItem("currentUser", JSON.stringify(data));
                alert("Compte créé avec succès !");
                window.location.href = "../dashboard.html";
            } catch (error) {
                alert(error.message);
            }
        });
    }
});
