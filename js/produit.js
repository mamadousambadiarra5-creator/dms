const API_URL = "http://localhost:3001/api";
let produits = [];

document.addEventListener("DOMContentLoaded", () => {
    chargerProduits();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const query = searchInput.value.toLowerCase();
            afficherProduits(query);
        });
    }

    const produitForm = document.getElementById("produitForm");
    if (produitForm) {
        produitForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sauvegarderProduit();
        });
    }
});

async function chargerProduits() {
    try {
        const response = await fetch(`${API_URL}/produits`);
        if (!response.ok) throw new Error("Erreur de chargement des produits");
        produits = await response.json();
        afficherProduits();
    } catch (error) {
        console.error(error);
        alert("Impossible de charger les produits.");
    }
}

function openPopup(id, editId = -1) {
    document.getElementById(id).style.display = "flex";
    if (editId > -1) {
        const prod = produits.find(p => p.id === editId);
        document.getElementById("popupTitle").textContent = "Modifier le produit";
        document.getElementById("editIndex").value = editId;
        document.getElementById("nom").value = prod ? prod.nom : "";
        document.getElementById("prix").value = prod ? prod.prix : "";
    } else {
        document.getElementById("popupTitle").textContent = "Ajouter un produit";
        document.getElementById("editIndex").value = "-1";
        document.getElementById("nom").value = "";
        document.getElementById("prix").value = "";
    }
}

function closePopup(id) {
    document.getElementById(id).style.display = "none";
}

function afficherProduits(filter = "") {
    const tableBody = document.getElementById("produitTable");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    produits.forEach((produit) => {
        if (filter && !produit.nom.toLowerCase().includes(filter)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${produit.nom}</td>
            <td>${produit.prix} FCFA</td>
            <td>
                <button onclick="openPopup('popupProduit', ${produit.id})">Modifier</button>
                <button class="close-btn" onclick="supprimerProduit(${produit.id})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function sauvegarderProduit() {
    const nom = document.getElementById("nom").value.trim();
    const prix = parseFloat(document.getElementById("prix").value);
    const editId = parseInt(document.getElementById("editIndex").value);

    if (!nom || isNaN(prix)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    try {
        let response;
        if (editId === -1) {
            response = await fetch(`${API_URL}/produits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prix })
            });
        } else {
            response = await fetch(`${API_URL}/produits/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prix })
            });
        }

        if (!response.ok) throw new Error("Erreur lors de l'enregistrement");

        closePopup("popupProduit");
        await chargerProduits();
    } catch (error) {
        alert(error.message);
    }
}

async function supprimerProduit(id) {
    const prod = produits.find(p => p.id === id);
    if (!prod) return;

    if (confirm(`Voulez-vous vraiment supprimer le produit "${prod.nom}" ?`)) {
        try {
            const response = await fetch(`${API_URL}/produits/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression");
            await chargerProduits();
        } catch (error) {
            alert(error.message);
        }
    }
}
