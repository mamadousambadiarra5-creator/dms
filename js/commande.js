const defaultCommandes = [
    {
        id: "CMD-1",
        nom: "Koffi Jean",
        nourriture: "Poulet entier, Coca-Cola",
        quantite: 1,
        prixInitial: 4200,
        prixTotal: 4000,
        reste: 200,
        message: "Bien cuit",
        date: "30/06/2026",
        heure: "12:15:30"
    },
    {
        id: "CMD-2",
        nom: "Diallo Mariam",
        nourriture: "Sandwich, Fanta",
        quantite: 2,
        prixInitial: 2400,
        prixTotal: 2400,
        reste: 0,
        message: "Sans oignon",
        date: "30/06/2026",
        heure: "10:45:10"
    }
];

let commandes = JSON.parse(localStorage.getItem("commandes"));
if (!commandes || commandes.length === 0) {
    commandes = defaultCommandes;
    localStorage.setItem("commandes", JSON.stringify(commandes));
}

document.addEventListener("DOMContentLoaded", () => {
    afficherCommandes();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const query = searchInput.value.toLowerCase();
            afficherCommandes(query);
        });
    }
});

function afficherCommandes(filter = "") {
    const tableBody = document.getElementById("historiqueCommandeTable");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    commandes.forEach((cmd, index) => {
        const clientName = cmd.nom || "Client";
        const products = cmd.nourriture || "Produit";
        
        if (filter && !clientName.toLowerCase().includes(filter) && !products.toLowerCase().includes(filter)) {
            return;
        }

        // Si la commande n'a pas d'identifiant unique, on lui en attribue un
        if (!cmd.id) {
            cmd.id = "CMD-" + (Date.now() + index);
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
                <button class="close-btn" onclick="supprimerCommande(${index})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    // Mettre à jour l'ID local
    localStorage.setItem("commandes", JSON.stringify(commandes));
}

function supprimerCommande(index) {
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
        commandes.splice(index, 1);
        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherCommandes();
    }
}

function voirFacture(id) {
    window.location.href = `facture.html?id=${id}`;
}
