const API_URL = "http://localhost:3001/api";
let membres = [];

document.addEventListener("DOMContentLoaded", () => {
    chargerMembres();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const query = searchInput.value.toLowerCase();
            afficherMembres(query);
        });
    }

    const membreForm = document.getElementById("membreForm");
    if (membreForm) {
        membreForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sauvegarderMembre();
        });
    }
});

async function chargerMembres() {
    try {
        const response = await fetch(`${API_URL}/membres`);
        if (!response.ok) throw new Error("Erreur lors du chargement des membres.");
        membres = await response.json();
        afficherMembres();
    } catch (error) {
        console.error(error);
        alert("Impossible de charger les membres.");
    }
}

function openPopup(id, editId = -1) {
    document.getElementById(id).style.display = "flex";
    if (editId > -1) {
        const member = membres.find(m => m.id === editId);
        document.getElementById("popupTitle").textContent = "Modifier le membre";
        document.getElementById("editIndex").value = editId;
        document.getElementById("nom").value = member ? member.nom : "";
        document.getElementById("prenom").value = member ? member.prenom : "";
    } else {
        document.getElementById("popupTitle").textContent = "Ajouter un membre";
        document.getElementById("editIndex").value = "-1";
        document.getElementById("nom").value = "";
        document.getElementById("prenom").value = "";
    }
}

function closePopup(id) {
    document.getElementById(id).style.display = "none";
}

function afficherMembres(filter = "") {
    const tableBody = document.getElementById("membreTable");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    membres.forEach((membre) => {
        if (filter && !membre.nom.toLowerCase().includes(filter) && !membre.prenom.toLowerCase().includes(filter)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${membre.nom}</td>
            <td>${membre.prenom}</td>
            <td>
                <button onclick="commanderMembre('${membre.nom}', '${membre.prenom}')">🛒 Commander</button>
                <button onclick="openPopup('popupMembre', ${membre.id})">Modifier</button>
                <button class="close-btn" onclick="supprimerMembre(${membre.id})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function sauvegarderMembre() {
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const editId = parseInt(document.getElementById("editIndex").value);

    if (!nom || !prenom) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    try {
        let response;
        if (editId === -1) {
            response = await fetch(`${API_URL}/membres`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prenom })
            });
        } else {
            response = await fetch(`${API_URL}/membres/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prenom })
            });
        }

        if (!response.ok) throw new Error("Erreur lors de l'enregistrement");

        closePopup("popupMembre");
        await chargerMembres();
    } catch (error) {
        alert(error.message);
    }
}

async function supprimerMembre(id) {
    const member = membres.find(m => m.id === id);
    if (!member) return;

    if (confirm(`Voulez-vous vraiment supprimer le membre "${member.nom} ${member.prenom}" ?`)) {
        try {
            const response = await fetch(`${API_URL}/membres/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression");
            await chargerMembres();
        } catch (error) {
            alert(error.message);
        }
    }
}

function commanderMembre(nom, prenom) {
    const nomComplet = encodeURIComponent(`${nom} ${prenom}`);
    window.location.href = `nouvelle-commande.html?membre=${nomComplet}`;
}
