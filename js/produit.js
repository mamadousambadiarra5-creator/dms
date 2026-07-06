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
    { nom: "Eau Minérale", prix: 500 },
    { nom: "Jus pressé", prix: 1000 },
    { nom: "Energy Drink", prix: 500 }
];

let produits = JSON.parse(localStorage.getItem("produits"));
if (!produits || produits.length === 0) {
    produits = defaultProduits;
    localStorage.setItem("produits", JSON.stringify(produits));
}

document.addEventListener("DOMContentLoaded", () => {
    afficherProduits();

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

function openPopup(id, editIdx = -1) {
    document.getElementById(id).style.display = "flex";
    if (editIdx > -1) {
        document.getElementById("popupTitle").textContent = "Modifier le produit";
        document.getElementById("editIndex").value = editIdx;
        document.getElementById("nom").value = produits[editIdx].nom;
        document.getElementById("prix").value = produits[editIdx].prix;
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

    produits.forEach((produit, index) => {
        if (filter && !produit.nom.toLowerCase().includes(filter)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${produit.nom}</td>
            <td>${produit.prix} FCFA</td>
            <td>
                <button onclick="openPopup('popupProduit', ${index})">Modifier</button>
                <button class="close-btn" onclick="supprimerProduit(${index})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function sauvegarderProduit() {
    const nom = document.getElementById("nom").value.trim();
    const prix = parseFloat(document.getElementById("prix").value);
    const editIndex = parseInt(document.getElementById("editIndex").value);

    if (!nom || isNaN(prix)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    if (editIndex === -1) {
        produits.push({ nom, prix });
    } else {
        produits[editIndex] = { nom, prix };
    }

    localStorage.setItem("produits", JSON.stringify(produits));
    closePopup("popupProduit");
    afficherProduits();
}

function supprimerProduit(index) {
    if (confirm(`Voulez-vous vraiment supprimer le produit "${produits[index].nom}" ?`)) {
        produits.splice(index, 1);
        localStorage.setItem("produits", JSON.stringify(produits));
        afficherProduits();
    }
}
