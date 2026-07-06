document.addEventListener("DOMContentLoaded", () => {
    chargerMembresSelect();
    chargerProduitsCheckbox();

    const form = document.getElementById("commandeForm");
    const prixTotalInput = document.getElementById("prixTotal");

    if (prixTotalInput) {
        prixTotalInput.addEventListener("input", calculerReste);
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            validerCommande();
        });
    }

    // Gestion du membre pré-sélectionné dans l'URL (via redirection de la page membre)
    const urlParams = new URLSearchParams(window.location.search);
    const membreParam = urlParams.get("membre");
    if (membreParam) {
        const select = document.getElementById("nomCommande");
        if (select) {
            select.value = decodeURIComponent(membreParam);
        }
    }
});

function chargerMembresSelect() {
    const select = document.getElementById("nomCommande");
    if (!select) return;

    const membres = JSON.parse(localStorage.getItem("membres")) || [];
    membres.forEach(m => {
        const option = document.createElement("option");
        const nomComplet = `${m.nom} ${m.prenom}`;
        option.value = nomComplet;
        option.textContent = nomComplet;
        select.appendChild(option);
    });
}

function chargerProduitsCheckbox() {
    const container = document.getElementById("productListContainer");
    if (!container) return;

    const produits = JSON.parse(localStorage.getItem("produits")) || [];
    container.innerHTML = "";

    if (produits.length === 0) {
        container.innerHTML = "<p style='color: #666;'>Aucun produit disponible. Ajoutez-en d'abord dans la page Produits.</p>";
        return;
    }

    produits.forEach((prod, index) => {
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
            <div class="product-info">
                <input type="checkbox" id="prod-${index}" class="prod-cb" value="${prod.nom}" data-prix="${prod.prix}">
                <label for="prod-${index}">${prod.nom} - <span style="color:#28a745; font-weight:bold;">${prod.prix} FCFA</span></label>
            </div>
            <div class="product-qty">
                <label for="qty-${index}">Qté:</label>
                <input type="number" id="qty-${index}" class="prod-qty-input" value="1" min="1" disabled>
            </div>
        `;
        container.appendChild(item);

        // Events
        const cb = item.querySelector(".prod-cb");
        const qty = item.querySelector(".prod-qty-input");

        cb.addEventListener("change", () => {
            qty.disabled = !cb.checked;
            if (!cb.checked) {
                qty.value = 1;
            }
            calculerMontantTotal();
        });

        qty.addEventListener("input", calculerMontantTotal);
    });
}

function calculerMontantTotal() {
    let total = 0;
    const checkboxes = document.querySelectorAll(".prod-cb");

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const qtyInput = cb.closest(".product-item").querySelector(".prod-qty-input");
            const price = parseFloat(cb.dataset.prix);
            const qty = parseInt(qtyInput.value) || 1;
            total += price * qty;
        }
    });

    const prixInitialInput = document.getElementById("prixInitial");
    if (prixInitialInput) {
        prixInitialInput.value = total;
    }

    calculerReste();
}

function calculerReste() {
    const total = parseFloat(document.getElementById("prixInitial").value) || 0;
    const payeInput = document.getElementById("prixTotal");
    const resteInput = document.getElementById("reste");

    if (payeInput && resteInput) {
        const paye = parseFloat(payeInput.value) || 0;
        resteInput.value = total - paye;
    }
}

function validerCommande() {
    const client = document.getElementById("nomCommande").value;
    const note = document.getElementById("message").value.trim();
    const prixInitial = parseFloat(document.getElementById("prixInitial").value) || 0;
    const prixTotal = parseFloat(document.getElementById("prixTotal").value) || 0;
    const reste = parseFloat(document.getElementById("reste").value) || 0;

    if (!client) {
        alert("Veuillez sélectionner un membre.");
        return;
    }

    const produitsSelectionnes = [];
    let totalQty = 0;
    const checkboxes = document.querySelectorAll(".prod-cb");

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const qtyInput = cb.closest(".product-item").querySelector(".prod-qty-input");
            const qty = parseInt(qtyInput.value) || 1;
            produitsSelectionnes.push(`${qty}x ${cb.value}`);
            totalQty += qty;
        }
    });

    if (produitsSelectionnes.length === 0) {
        alert("Veuillez sélectionner au moins un produit.");
        return;
    }

    const nourriture = produitsSelectionnes.join(", ");
    const commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    const maintenant = new Date();
    const date = maintenant.toLocaleDateString();
    const heure = maintenant.toLocaleTimeString();

    const nouvelleCommande = {
        id: "CMD-" + Date.now(),
        nom: client,
        nourriture,
        quantite: totalQty,
        prixInitial,
        prixTotal, // montant payé
        reste,     // reste à payer
        message: note,
        date,
        heure
    };

    commandes.push(nouvelleCommande);
    localStorage.setItem("commandes", JSON.stringify(commandes));

    alert("Commande enregistrée avec succès !");
    window.location.href = "commandes.html";
}
