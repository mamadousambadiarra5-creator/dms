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
    chargerUtilisateur();
    chargerStatistiques();
    chargerCommandes();
});

// USER CONNECTE
function chargerUtilisateur() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && document.getElementById("username")) {
        document.getElementById("username").textContent = user.name;
    }
}

// STATISTIQUES
async function chargerStatistiques() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        if (!response.ok) throw new Error("Erreur de chargement des statistiques");
        const stats = await response.json();

        if (document.getElementById("totalProduits")) {
            document.getElementById("totalProduits").textContent = stats.totalProduits;
        }
        if (document.getElementById("totalMembres")) {
            document.getElementById("totalMembres").textContent = stats.totalMembres;
        }
        if (document.getElementById("totalCommandes")) {
            document.getElementById("totalCommandes").textContent = stats.totalCommandes;
        }
        if (document.getElementById("totalMoney")) {
            document.getElementById("totalMoney").textContent = stats.totalMoney + " FCFA";
        }
    } catch (error) {
        console.error("Erreur stats :", error);
    }
}

// TABLE COMMANDES (5 dernières)
async function chargerCommandes() {
    let table = document.getElementById("commandeTable");
    if (!table) return;

    try {
        const response = await fetch(`${API_URL}/commandes`);
        if (!response.ok) throw new Error("Erreur de chargement des commandes");
        const commandes = await response.json();

        table.innerHTML = "";

        // Le backend renvoie déjà trié par date_cmd desc, on prend les 5 premières
        commandes.slice(0, 5).forEach(c => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${c.nom || "Client"}</td>
                <td>${c.nourriture || "Produit"}</td>
                <td>${c.prixInitial || 0} FCFA</td>
                <td>${c.date || "-"} ${c.heure || ""}</td>
            `;
            table.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur commandes dashboard :", error);
    }
}