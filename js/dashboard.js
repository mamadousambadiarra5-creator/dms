// ================= DASHBOARD =================

document.addEventListener("DOMContentLoaded", () => {
    initialiserDonneesSiVide();
    chargerUtilisateur();
    chargerStatistiques();
    chargerCommandes();
});

// Initialise des données de test si local storage est vide
function initialiserDonneesSiVide() {
    const defaultProduits = [
        { nom: "Pain grand", prix: 150 },
        { nom: "Pain petit", prix: 100 },
        { nom: "Poulet entier", prix: 4000 },
        { nom: "Frites", prix: 200 },
        { nom: "Brochette", prix: 200 },
        { nom: "Sandwich", prix: 1000 },
        { nom: "Coca-Cola", prix: 200 },
        { nom: "Fanta", prix: 200 },
        { nom: "Sprite", prix: 200 },
        { nom: "Eau Minérale", prix: 500 }
    ];

    const defaultMembres = [
        { nom: "Koffi", prenom: "Jean" },
        { nom: "Diallo", prenom: "Mariam" },
        { nom: "Sow", prenom: "Amadou" }
    ];

    const defaultCommandes = [
        {
            id: "CMD-1",
            nom: "Koffi Jean",
            nourriture: "1x Poulet entier, 1x Coca-Cola",
            quantite: 2,
            prixInitial: 4200,
            prixTotal: 4000,
            reste: 200,
            message: "Bien cuit",
            date: new Date().toLocaleDateString(),
            heure: "12:15:30"
        },
        {
            id: "CMD-2",
            nom: "Diallo Mariam",
            nourriture: "2x Sandwich, 2x Fanta",
            quantite: 4,
            prixInitial: 2400,
            prixTotal: 2400,
            reste: 0,
            message: "Sans oignon",
            date: new Date().toLocaleDateString(),
            heure: "10:45:10"
        }
    ];

    if (!localStorage.getItem("produits")) {
        localStorage.setItem("produits", JSON.stringify(defaultProduits));
    }
    if (!localStorage.getItem("membres")) {
        localStorage.setItem("membres", JSON.stringify(defaultMembres));
    }
    if (!localStorage.getItem("commandes")) {
        localStorage.setItem("commandes", JSON.stringify(defaultCommandes));
    }
}

// USER CONNECTE
function chargerUtilisateur() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && document.getElementById("username")) {
        document.getElementById("username").textContent = user.name;
    }
}

// STATISTIQUES
function chargerStatistiques() {
    let produits = JSON.parse(localStorage.getItem("produits")) || [];
    let membres = JSON.parse(localStorage.getItem("membres")) || [];
    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    if (document.getElementById("totalProduits")) {
        document.getElementById("totalProduits").textContent = produits.length;
    }
    if (document.getElementById("totalMembres")) {
        document.getElementById("totalMembres").textContent = membres.length;
    }
    if (document.getElementById("totalCommandes")) {
        document.getElementById("totalCommandes").textContent = commandes.length;
    }

    // Le montant initial représente le total facturé
    let total = commandes.reduce((sum, c) => sum + Number(c.prixInitial || 0), 0);
    if (document.getElementById("totalMoney")) {
        document.getElementById("totalMoney").textContent = total + " FCFA";
    }
}

// TABLE COMMANDES
function chargerCommandes() {
    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
    let table = document.getElementById("commandeTable");
    if (!table) return;

    table.innerHTML = "";

    // Prendre les 5 dernières commandes (les plus récentes en premier)
    commandes.slice().reverse().slice(0, 5).forEach(c => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.nom || "Client"}</td>
            <td>${c.nourriture || "Produit"}</td>
            <td>${c.prixInitial || 0} FCFA</td>
            <td>${c.date || "-"} ${c.heure || ""}</td>
        `;
        table.appendChild(tr);
    });
}