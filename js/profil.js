const API_URL = (() => {
    const params = new URLSearchParams(window.location.search);
    const queryApi = params.get("api");
    if (queryApi) return queryApi.replace(/\/$/, "");

    const storedApi = localStorage.getItem("API_URL");
    if (storedApi) return storedApi.replace(/\/$/, "");

    if (window.location.protocol === "file:") {
        return "http://localhost:3001/api";
    }

    return `${window.location.origin}/api`;
})();

document.addEventListener("DOMContentLoaded", () => {
    chargerProfil();

    const form = document.getElementById("profileForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            sauvegarderProfil();
        });
    }
});

function chargerProfil() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    document.getElementById("profileName").value = user.name || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("profilePhone").value = user.phone || "";
}

async function sauvegarderProfil() {
    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();
    const email = document.getElementById("profileEmail").value;

    if (!name || !phone) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, phone })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de la mise à jour du profil.");

        // Mettre à jour currentUser dans le stockage local pour refléter les changements sur la page
        localStorage.setItem("currentUser", JSON.stringify(data));

        alert("Profil mis à jour avec succès !");
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
}
