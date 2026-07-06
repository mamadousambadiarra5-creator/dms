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

function sauvegarderProfil() {
    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();
    const email = document.getElementById("profileEmail").value;

    if (!name || !phone) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Mettre à jour currentUser
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentUser.name = name;
    currentUser.phone = phone;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Mettre à jour dans la liste globale des utilisateurs (users)
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        users[userIndex].name = name;
        users[userIndex].phone = phone;
        localStorage.setItem("users", JSON.stringify(users));
    }

    alert("Profil mis à jour avec succès !");
    window.location.reload();
}
