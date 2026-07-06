document.addEventListener("DOMContentLoaded", () => {
    // Initialiser un compte administrateur par défaut si aucun n'existe
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.length === 0) {
        users.push({
            name: "Administrateur",
            email: "admin@samina.com",
            phone: "0102030405",
            password: "admin"
        });
        localStorage.setItem("users", JSON.stringify(users));
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem("currentUser", JSON.stringify(user));
                window.location.href = "../dashboard.html";
            } else {
                alert("Email ou mot de passe incorrect.");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;

            if (!name || !email || !phone || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.some(u => u.email === email);

            if (userExists) {
                alert("Cet email est déjà utilisé !");
                return;
            }

            const newUser = { name, email, phone, password };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(newUser));

            alert("Compte créé avec succès !");
            window.location.href = "../dashboard.html";
        });
    }
});
