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
        // Un petit délai pour s'assurer que les membres sont chargés
        setTimeout(() => {
            const select = document.getElementById("nomCommande");
            if (select) {
                select.value = decodeURIComponent(membreParam);
            }
        }, 500);
    }
});

async function chargerMembresSelect() {
    const select = document.getElementById("nomCommande");
    if (!select) return;

    try {
        const response = await fetch(`${API_URL}/membres`);
        if (!response.ok) throw new Error("Erreur de chargement des membres");
        const membres = await response.json();
        
        select.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
        membres.forEach(m => {
            const option = document.createElement("option");
            const nomComplet = `${m.nom} ${m.prenom}`;
            option.value = nomComplet;
            option.textContent = nomComplet;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des membres.");
    }
}

async function chargerProduitsCheckbox() {
    const container = document.getElementById("productListContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/produits`);
        if (!response.ok) throw new Error("Erreur de chargement des produits");
        const produits = await response.json();
        
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
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p style='color: red;'>Erreur lors du chargement des produits.</p>";
    }
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

async function validerCommande() {
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
    const checkboxes = document.querySelectorAll(".prod-cb");

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const qtyInput = cb.closest(".product-item").querySelector(".prod-qty-input");
            const qty = parseInt(qtyInput.value) || 1;
            produitsSelectionnes.push({
                nom: cb.value,
                quantite: qty,
                prix: parseFloat(cb.dataset.prix)
            });
        }
    });

    if (produitsSelectionnes.length === 0) {
        alert("Veuillez sélectionner au moins un produit.");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const payload = {
        clientName: client,
        prixInitial,
        prixTotal, // montant payé
        reste,     // reste à payer
        message: note,
        produits: produitsSelectionnes,
        email_usr: currentUser ? currentUser.email : ""
    };

    try {
        const response = await fetch(`${API_URL}/commandes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de la validation de la commande");

        alert("Commande enregistrée avec succès !");
        window.location.href = "commandes.html";
    } catch (error) {
        alert(error.message);
    }
}
