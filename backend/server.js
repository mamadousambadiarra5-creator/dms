const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Bootstrapping: Création d'un administrateur par défaut si la base est vide
async function bootstrap() {
  try {
    const userCount = await prisma.utilisateur.count();
    if (userCount === 0) {
      await prisma.utilisateur.create({
        data: {
          nom_usr: "Administrateur",
          prenom_usr: "",
          email_usr: "admin@samina.com",
          telephone_usr: "0102030405",
          motDePasse_usr: "admin",
          role_usr: "ADMIN",
          actif: true,
        },
      });
      console.log("Utilisateur admin par défaut créé (admin@samina.com / admin).");
    }


    // Créer des produits par défaut s'il n'y en a pas
    // const productCount = await prisma.produit.count();
    // if (productCount === 0) {
    //   const defaultUser = await prisma.utilisateur.findFirst();
    //   const defaultProduits = [
    //     { nom_prd: "Pain grand", prix_prd: 150, categorie_prd: "PLATS" },
    //     { nom_prd: "Pain petit", prix_prd: 100, categorie_prd: "PLATS" },
    //     { nom_prd: "Poulet entier", prix_prd: 4000, categorie_prd: "PLATS" },
    //     { nom_prd: "Frites", prix_prd: 200, categorie_prd: "PLATS" },
    //     { nom_prd: "Brochette", prix_prd: 200, categorie_prd: "PLATS" },
    //     { nom_prd: "Sandwich", prix_prd: 1000, categorie_prd: "PLATS" },
    //     { nom_prd: "Coca-Cola", prix_prd: 200, categorie_prd: "BOISSON" },
    //     { nom_prd: "Fanta", prix_prd: 200, categorie_prd: "BOISSON" },
    //     { nom_prd: "Sprite", prix_prd: 200, categorie_prd: "BOISSON" },
    //     { nom_prd: "Eau Minérale", prix_prd: 500, categorie_prd: "BOISSON" },
    //   ];

    //   for (const prod of defaultProduits) {
    //     await prisma.produit.create({
    //       data: {
    //         nom_prd: prod.nom_prd,
    //         prix_prd: prod.prix_prd,
    //         categorie_prd: prod.categorie_prd,
    //         id_usr: defaultUser.id_usr,
    //       },
    //     });
    //   }
    //   console.log("Produits par défaut créés.");
    


//     // Créer des membres par défaut s'il n'y en a pas
//     const memberCount = await prisma.membre.count();
//     if (memberCount === 0) {
//       const defaultMembres = [
//         { nom_mbr: "Koffi", prenom_mbr: "Jean" },
//         { nom_mbr: "Diallo", prenom_mbr: "Mariam" },
//         { nom_mbr: "Sow", prenom_mbr: "Amadou" },
//       ];

//       for (const mbr of defaultMembres) {
//         await prisma.membre.create({
//           data: mbr,
//         });
//       }
//       console.log("Membres par défaut créés.");
//     }
  } catch (error) {
    console.error("Erreur lors du bootstrapping de la base de données :", error);
  }
}

// ==================== AUTHENTIFICATION ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await prisma.utilisateur.findFirst({
      where: { email_usr: email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // Séparer le nom complet
    const parts = name.trim().split(" ");
    const nom = parts[0] || "Nom";
    const prenom = parts.slice(1).join(" ") || "";

    const user = await prisma.utilisateur.create({
      data: {
        nom_usr: nom,
        prenom_usr: prenom,
        email_usr: email,
        telephone_usr: phone,
        motDePasse_usr: password,
        role_usr: "CAISSIER", // Rôle par défaut
        actif: true,
      },
    });

    res.status(201).json({
      id: user.id_usr,
      name: `${user.nom_usr} ${user.prenom_usr}`.trim(),
      email: user.email_usr,
      phone: user.telephone_usr,
      role: user.role_usr,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.utilisateur.findFirst({
      where: {
        email_usr: email,
        motDePasse_usr: password,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    res.json({
      id: user.id_usr,
      name: `${user.nom_usr} ${user.prenom_usr}`.trim(),
      email: user.email_usr,
      phone: user.telephone_usr,
      role: user.role_usr,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/auth/profile", async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    const user = await prisma.utilisateur.findFirst({
      where: { email_usr: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const parts = name.trim().split(" ");
    const nom = parts[0];
    const prenom = parts.slice(1).join(" ");

    const updatedUser = await prisma.utilisateur.update({
      where: { id_usr: user.id_usr },
      data: {
        nom_usr: nom,
        prenom_usr: prenom,
        telephone_usr: phone,
      },
    });

    res.json({
      id: updatedUser.id_usr,
      name: `${updatedUser.nom_usr} ${updatedUser.prenom_usr}`.trim(),
      email: updatedUser.email_usr,
      phone: updatedUser.telephone_usr,
      role: updatedUser.role_usr,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUITS ====================

app.get("/api/produits", async (req, res) => {
  try {
    const produits = await prisma.produit.findMany();
    // Mapper pour correspondre au format attendu par le frontend
    const mapped = produits.map((p) => ({
      id: p.id_prd,
      nom: p.nom_prd,
      prix: Number(p.prix_prd),
      categorie: p.categorie_prd,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/produits", async (req, res) => {
  try {
    const { nom, prix, categorie } = req.body;

    const categorieValide = categorie === "PLATS" || categorie === "BOISSON";
    const lowerNom = (nom || "").toLowerCase();
    const isBoisson =
      lowerNom.includes("coca") ||
      lowerNom.includes("fanta") ||
      lowerNom.includes("sprite") ||
      lowerNom.includes("jus") ||
      lowerNom.includes("eau") ||
      lowerNom.includes("drink") ||
      lowerNom.includes("biere") ||
      lowerNom.includes("boisson");
    const categorieFinal = categorieValide ? categorie : isBoisson ? "BOISSON" : "PLATS";

    // Trouver un utilisateur par défaut pour la relation requise
    const defaultUser = await prisma.utilisateur.findFirst();
    if (!defaultUser) {
      return res.status(400).json({ error: "Aucun utilisateur disponible pour associer le produit." });
    }

    const produit = await prisma.produit.create({
      data: {
        nom_prd: nom,
        prix_prd: Number(prix),
        categorie_prd: categorieFinal,
        id_usr: defaultUser.id_usr,
      },
    });

    res.status(201).json({
      id: produit.id_prd,
      nom: produit.nom_prd,
      prix: Number(produit.prix_prd),
      categorie: produit.categorie_prd,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/produits/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix, categorie } = req.body;
    const categorieValide = categorie === "PLATS" || categorie === "BOISSON";

    const updated = await prisma.produit.update({
      where: { id_prd: Number(id) },
      data: {
        nom_prd: nom,
        prix_prd: Number(prix),
        ...(categorieValide ? { categorie_prd: categorie } : {}),
      },
    });

    res.json({
      id: updated.id_prd,
      nom: updated.nom_prd,
      prix: Number(updated.prix_prd),
      categorie: updated.categorie_prd,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/produits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer d'abord les détails de commande liés pour éviter des erreurs d'intégrité
    await prisma.detailCommande.deleteMany({
      where: { id_prd: Number(id) },
    });

    await prisma.produit.delete({
      where: { id_prd: Number(id) },
    });

    res.json({ message: "Produit supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEMBRES ====================

app.get("/api/membres", async (req, res) => {
  try {
    const membres = await prisma.membre.findMany();
    const mapped = membres.map((m) => ({
      id: m.id_mbr,
      nom: m.nom_mbr,
      prenom: m.prenom_mbr,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/membres", async (req, res) => {
  try {
    const { nom, prenom } = req.body;

    const membre = await prisma.membre.create({
      data: {
        nom_mbr: nom,
        prenom_mbr: prenom,
      },
    });

    res.status(201).json({
      id: membre.id_mbr,
      nom: membre.nom_mbr,
      prenom: membre.prenom_mbr,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/membres/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom } = req.body;

    const updated = await prisma.membre.update({
      where: { id_mbr: Number(id) },
      data: {
        nom_mbr: nom,
        prenom_mbr: prenom,
      },
    });

    res.json({
      id: updated.id_mbr,
      nom: updated.nom_mbr,
      prenom: updated.prenom_mbr,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/membres/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer les commandes associées ou détacher
    const orders = await prisma.commande.findMany({
      where: { id_mbr: Number(id) },
    });

    for (const order of orders) {
      await prisma.detailCommande.deleteMany({
        where: { id_cmd: order.id_cmd },
      });
    }

    await prisma.commande.deleteMany({
      where: { id_mbr: Number(id) },
    });

    await prisma.membre.delete({
      where: { id_mbr: Number(id) },
    });

    res.json({ message: "Membre supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMMANDES ====================

app.get("/api/commandes", async (req, res) => {
  try {
    const commandes = await prisma.commande.findMany({
      include: {
        membre: true,
        details: {
          include: {
            produit: true,
          },
        },
      },
      orderBy: {
        date_cmd: "desc",
      },
    });

    // Transformer les données pour le frontend
    const mapped = commandes.map((c) => {
      const nourritureList = c.details.map((d) => `${d.quantite}x ${d.produit.nom_prd}`);
      const totalQty = c.details.reduce((sum, d) => sum + d.quantite, 0);

      const d = new Date(c.date_cmd);
      const dateStr = d.toLocaleDateString("fr-FR");
      const heureStr = d.toLocaleTimeString("fr-FR");

      return {
        id: `CMD-${c.id_cmd}`,
        nom: `${c.membre.nom_mbr} ${c.membre.prenom_mbr}`.trim(),
        nourriture: nourritureList.join(", "),
        quantite: totalQty,
        prixInitial: Number(c.prix_total),
        prixTotal: Number(c.montant_payer),
        reste: Number(c.reste),
        message: c.message || "",
        date: dateStr,
        heure: heureStr,
        details: c.details.map((dt) => ({
          nom: dt.produit.nom_prd,
          quantite: dt.quantite,
          prix_unitaire: Number(dt.prix_unitaire),
          sous_total: Number(dt.sous_total)
        }))
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/commandes", async (req, res) => {
  try {
    const { clientName, prixInitial, prixTotal, reste, message, produits, email_usr } = req.body;

    // 1. Résoudre le membre
    let member = await prisma.membre.findFirst({
      where: {
        OR: [
          {
            AND: [
              { nom_mbr: clientName.split(" ")[0] || "" },
              { prenom_mbr: clientName.split(" ").slice(1).join(" ") || "" },
            ],
          },
          { nom_mbr: clientName },
        ],
      },
    });

    if (!member) {
      const parts = clientName.trim().split(" ");
      const nom = parts[0] || "Client";
      const prenom = parts.slice(1).join(" ") || "";
      member = await prisma.membre.create({
        data: { nom_mbr: nom, prenom_mbr: prenom },
      });
    }

    // 2. Résoudre l'utilisateur
    let user = null;
    if (email_usr) {
      user = await prisma.utilisateur.findFirst({ where: { email_usr: email_usr } });
    }
    if (!user) {
      user = await prisma.utilisateur.findFirst();
    }
    if (!user) {
      return res.status(400).json({ error: "Aucun utilisateur disponible pour enregistrer la commande." });
    }

    // 3. Créer la commande et ses détails dans une transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const commande = await tx.commande.create({
        data: {
          date_cmd: new Date(),
          prix_total: Number(prixInitial),
          montant_payer: Number(prixTotal),
          reste: Number(reste),
          message: message || "",
          id_mbr: member.id_mbr,
          id_usr: user.id_usr,
        },
      });

      for (const prod of produits) {
        // Résoudre le produit par son nom ou en trouver/créer un par défaut
        let productObj = await tx.produit.findFirst({
          where: { nom_prd: prod.nom },
        });

        if (!productObj) {
          // Créer un produit temporaire pour éviter l'échec
          productObj = await tx.produit.create({
            data: {
              nom_prd: prod.nom,
              prix_prd: Number(prod.prix),
              categorie_prd: "PLATS",
              id_usr: user.id_usr,
            },
          });
        }

        const sousTotal = Number(prod.prix) * Number(prod.quantite);

        await tx.detailCommande.create({
          data: {
            id_cmd: commande.id_cmd,
            id_prd: productObj.id_prd,
            quantite: Number(prod.quantite),
            prix_unitaire: Number(prod.prix),
            sous_total: sousTotal,
          },
        });
      }

      return commande;
    });

    res.status(201).json({
      id: `CMD-${transaction.id_cmd}`,
      message: "Commande créée avec succès !",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/commandes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = Number(id.replace("CMD-", ""));

    await prisma.detailCommande.deleteMany({
      where: { id_cmd: cleanId },
    });

    await prisma.commande.delete({
      where: { id_cmd: cleanId },
    });

    res.json({ message: "Commande supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD / STATS ====================

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const productsCount = await prisma.produit.count();
    const membersCount = await prisma.membre.count();
    const ordersCount = await prisma.commande.count();

    const orders = await prisma.commande.findMany({
      select: {
        prix_total: true, // Chiffre d'affaires représenté par le montant facturé (prixInitial)
      },
    });

    const revenue = orders.reduce((sum, o) => sum + Number(o.prix_total), 0);

    res.json({
      totalProduits: productsCount,
      totalMembres: membersCount,
      totalCommandes: ordersCount,
      totalMoney: revenue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lancement du serveur et initialisation
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
  await bootstrap();
});