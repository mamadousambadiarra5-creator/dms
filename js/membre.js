const defaultMembres = [
    { nom: "Koffi", prenom: "Jean" },
    { nom: "Diallo", prenom: "Mariam" },
    { nom: "Sow", prenom: "Amadou" }
];

let membres = JSON.parse(localStorage.getItem("membres"));
if (!membres || membres.length === 0) {
    membres = defaultMembres;
    localStorage.setItem("membres", JSON.stringify(membres));
}

document.addEventListener("DOMContentLoaded", () => {
    afficherMembres();

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

function openPopup(id, editIdx = -1) {
    document.getElementById(id).style.display = "flex";
    if (editIdx > -1) {
        document.getElementById("popupTitle").textContent = "Modifier le membre";
        document.getElementById("editIndex").value = editIdx;
        document.getElementById("nom").value = membres[editIdx].nom;
        document.getElementById("prenom").value = membres[editIdx].prenom;
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

    membres.forEach((membre, index) => {
        const nomComplet = `${membre.nom} ${membre.prenom}`;
        if (filter && !membre.nom.toLowerCase().includes(filter) && !membre.prenom.toLowerCase().includes(filter)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${membre.nom}</td>
            <td>${membre.prenom}</td>
            <td>
                <button onclick="commanderMembre('${membre.nom}', '${membre.prenom}')">🛒 Commander</button>
                <button onclick="openPopup('popupMembre', ${index})">Modifier</button>
                <button class="close-btn" onclick="supprimerMembre(${index})">Supprimer</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function sauvegarderMembre() {
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const editIndex = parseInt(document.getElementById("editIndex").value);

    if (!nom || !prenom) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    if (editIndex === -1) {
        membres.push({ nom, prenom });
    } else {
        membres[editIndex] = { nom, prenom };
    }

    localStorage.setItem("membres", JSON.stringify(membres));
    closePopup("popupMembre");
    afficherMembres();
}

function supprimerMembre(index) {
    if (confirm(`Voulez-vous vraiment supprimer le membre "${membres[index].nom} ${membres[index].prenom}" ?`)) {
        membres.splice(index, 1);
        localStorage.setItem("membres", JSON.stringify(membres));
        afficherMembres();
    }
}

function commanderMembre(nom, prenom) {
    const nomComplet = encodeURIComponent(`${nom} ${prenom}`);
    window.location.href = `nouvelle-commande.html?membre=${nomComplet}`;
}
