const API_URL = "http://localhost:3001/api";
let commandes = [];

document.addEventListener("DOMContentLoaded", () => {
    chargerCommandes();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const query = searchInput.value.toLowerCase();
            afficherCommandes(query);
        });
    }
});

async function chargerCommandes() {
    try {
        const response = await fetch(`${API_URL}/commandes`);
        if (!response.ok) throw new Error("Erreur de chargement des commandes");
        commandes = await response.json();
        afficherCommandes();
    } catch (error) {
        console.error(error);
        alert("Impossible de charger l'historique des commandes.");
    }
}

function afficherCommandes(filter = "") {
    const tableBody = document.getElementById("historiqueCommandeTable");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    commandes.forEach((cmd) => {
        const clientName = cmd.nom || "Client";
        const products = cmd.nourriture || "Produit";
        
        if (filter && !clientName.toLowerCase().includes(filter) && !products.toLowerCase().includes(filter)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${clientName}</td>
            <td>${products}</td>
            <td>${cmd.quantite || 1}</td>
            <td>${cmd.prixInitial || 0} FCFA</td>
            <td>${cmd.prixTotal || 0} FCFA</td>
            <td>${cmd.reste !== undefined ? cmd.reste : (cmd.prixInitial - cmd.prixTotal)} FCFA</td>
            <td>${cmd.message || "-"}</td>
            <td>${cmd.date || ""} ${cmd.heure || ""}</td>
            <td>
                <button onclick="voirFacture('${cmd.id}')">🧾 Facture</button>
                <button class="close-btn" onclick="supprimerCommande('${cmd.id}')">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function supprimerCommande(id) {
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
        try {
            const response = await fetch(`${API_URL}/commandes/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression de la commande.");
            await chargerCommandes();
        } catch (error) {
            alert(error.message);
        }
    }
}

function voirFacture(id) {
    window.location.href = `facture.html?id=${id}`;
}
