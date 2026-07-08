# Documentation d'Intégration de la Base de Données (MySQL + Prisma + Express)

Ce document décrit l'architecture, la structure des tables, les requêtes Prisma/Express et les étapes pour faire fonctionner l'intégration de la base de données dans le projet **Mini Commande Samina**.

---

## 1. Architecture Générale

L'application a été migrée d'une architecture purement locale (`localStorage` dans le navigateur) vers un modèle client-serveur classique :

```
[ FRONTEND ] (HTML/CSS/JS)
     │
     ▼ (Requêtes fetch asynchrones sur le port 3001)
[ BACKEND API ] (Node.js + Express)
     │
     ▼ (Prisma Client ORM)
[ BASE DE DONNÉES ] (MySQL local sous le service MySQL95)
```

---

## 2. Schéma de Base de Données (Prisma)

Le fichier [schema.prisma](file:///c:/Users/simp7/Desktop/dms/backend/prisma/schema.prisma) définit les modèles relationnels suivants :

### Modèle `Utilisateur` (Table: `utilisateur`)
Stocke les administrateurs et caissiers gérant le système.
- `id_usr` (Int, PK, Autoincrement)
- `nom_usr` (String)
- `prenom_usr` (String)
- `telephone_usr` (String, Optionnel)
- `email_usr` (String, Unique, Optionnel)
- `motDePasse_usr` (String)
- `role_usr` (Enum: `ADMIN`, `CAISSIER`)
- `actif` (Boolean, Défaut: `true`)

### Modèle `Produit` (Table: `produit`)
Stocke les plats et boissons disponibles à la commande.
- `id_prd` (Int, PK, Autoincrement)
- `nom_prd` (String)
- `prix_prd` (Decimal)
- `categorie_prd` (Enum: `PLATS`, `BOISSON`)
- `id_usr` (Int, FK vers `Utilisateur`)

### Modèle `Membre` (Table: `membre`)
Stocke les clients (membres) de l'établissement.
- `id_mbr` (Int, PK, Autoincrement)
- `nom_mbr` (String)
- `prenom_mbr` (String)

### Modèle `Commande` (Table: `commande`)
Enregistre la commande principale passée pour un membre.
- `id_cmd` (Int, PK, Autoincrement)
- `date_cmd` (DateTime, spécifié à l'insertion)
- `prix_total` (Decimal, Total facturé)
- `montant_payer` (Decimal, Montant déjà payé)
- `reste` (Decimal, Chiffre restant à payer)
- `message` (String, Instructions de préparation, Optionnel)
- `id_mbr` (Int, FK vers `Membre`)
- `id_usr` (Int, FK vers `Utilisateur` qui a créé la commande)

### Modèle `DetailCommande` (Table: `detail_commande`)
Table pivot stockant les produits individuels associés à une commande.
- `id_detail` (Int, PK, Autoincrement)
- `id_cmd` (Int, FK vers `Commande`)
- `id_prd` (Int, FK vers `Produit`)
- `quantite` (Int, Défaut: `1`)
- `prix_unitaire` (Decimal)
- `sous_total` (Decimal)

---

## 3. Endpoints API et Requêtes de Fonctionnement (Prisma Queries)

Voici la description complète de chaque route backend implémentée dans le fichier [server.js](file:///c:/Users/simp7/Desktop/dms/backend/server.js) :

### 3.1 Authentification (`/api/auth`)

#### `POST /api/auth/register` (Inscription)
Crée un nouvel utilisateur. Sépare le nom complet envoyé en entrée en `nom_usr` et `prenom_usr`.
* **Corps de la requête** : `{ name, email, phone, password }`
* **Requête Prisma** :
  ```javascript
  const user = await prisma.utilisateur.create({
    data: {
      nom_usr: nom,
      prenom_usr: prenom,
      email_usr: email,
      telephone_usr: phone,
      motDePasse_usr: password,
      role_usr: "CAISSIER",
      actif: true
    }
  });
  ```

#### `POST /api/auth/login` (Connexion)
Authentifie l'utilisateur à l'aide de son email et mot de passe.
* **Corps de la requête** : `{ email, password }`
* **Requête Prisma** :
  ```javascript
  const user = await prisma.utilisateur.findFirst({
    where: {
      email_usr: email,
      motDePasse_usr: password
    }
  });
  ```

#### `PUT /api/auth/profile` (Mise à jour du profil)
Modifie les informations de profil de l'utilisateur connecté.
* **Corps de la requête** : `{ email, name, phone }`
* **Requête Prisma** :
  ```javascript
  const updatedUser = await prisma.utilisateur.update({
    where: { id_usr: user.id_usr },
    data: {
      nom_usr: nom,
      prenom_usr: prenom,
      telephone_usr: phone
    }
  });
  ```

---

### 3.2 Produits (`/api/produits`)

#### `GET /api/produits` (Liste des produits)
Récupère tous les produits.
* **Requête Prisma** :
  ```javascript
  const produits = await prisma.produit.findMany();
  ```

#### `POST /api/produits` (Création)
Ajoute un produit et détermine sa catégorie (`BOISSON` ou `PLATS`) automatiquement à partir de son nom.
* **Corps de la requête** : `{ nom, prix }`
* **Requête Prisma** :
  ```javascript
  const produit = await prisma.produit.create({
    data: {
      nom_prd: nom,
      prix_prd: Number(prix),
      categorie_prd: categorie,
      id_usr: defaultUser.id_usr // Premier utilisateur administrateur
    }
  });
  ```

#### `PUT /api/produits/:id` (Modification)
* **Corps de la requête** : `{ nom, prix }`
* **Requête Prisma** :
  ```javascript
  const updated = await prisma.produit.update({
    where: { id_prd: Number(id) },
    data: {
      nom_prd: nom,
      prix_prd: Number(prix)
    }
  });
  ```

#### `DELETE /api/produits/:id` (Suppression)
Supprime un produit (ainsi que ses liaisons dans `detail_commande`).
* **Requête Prisma** :
  ```javascript
  await prisma.detailCommande.deleteMany({ where: { id_prd: Number(id) } });
  await prisma.produit.delete({ where: { id_prd: Number(id) } });
  ```

---

### 3.3 Membres (`/api/membres`)

#### `GET /api/membres` (Liste des membres)
* **Requête Prisma** :
  ```javascript
  const membres = await prisma.membre.findMany();
  ```

#### `POST /api/membres` (Création)
* **Corps de la requête** : `{ nom, prenom }`
* **Requête Prisma** :
  ```javascript
  const membre = await prisma.membre.create({
    data: { nom_mbr: nom, prenom_mbr: prenom }
  });
  ```

#### `PUT /api/membres/:id` (Modification)
* **Corps de la requête** : `{ nom, prenom }`
* **Requête Prisma** :
  ```javascript
  const updated = await prisma.membre.update({
    where: { id_mbr: Number(id) },
    data: { nom_mbr: nom, prenom_mbr: prenom }
  });
  ```

#### `DELETE /api/membres/:id` (Suppression)
Supprime un membre, ainsi que toutes ses commandes et détails de commandes associés pour éviter les erreurs d'intégrité de clé étrangère.
* **Requête Prisma** :
  ```javascript
  // 1. Trouver les commandes du membre
  const orders = await prisma.commande.findMany({ where: { id_mbr: Number(id) } });
  // 2. Supprimer les détails de chaque commande
  for (const order of orders) {
    await prisma.detailCommande.deleteMany({ where: { id_cmd: order.id_cmd } });
  }
  // 3. Supprimer les commandes
  await prisma.commande.deleteMany({ where: { id_mbr: Number(id) } });
  // 4. Supprimer le membre
  await prisma.membre.delete({ where: { id_mbr: Number(id) } });
  ```

---

### 3.4 Commandes (`/api/commandes`)

#### `GET /api/commandes` (Historique des commandes)
Récupère l'ensemble des commandes en joignant les informations du membre ainsi que les détails avec le nom des produits associés.
* **Requête Prisma** :
  ```javascript
  const commandes = await prisma.commande.findMany({
    include: {
      membre: true,
      details: {
        include: { produit: true }
      }
    },
    orderBy: { date_cmd: "desc" }
  });
  ```

#### `POST /api/commandes` (Création de commande)
Crée une commande et lie les produits dans une **transaction de base de données** pour assurer que tout ou rien ne soit enregistré.
* **Corps de la requête** :
  ```json
  {
    "clientName": "Koffi Jean",
    "prixInitial": 4200,
    "prixTotal": 4000,
    "reste": 200,
    "message": "Bien cuit",
    "produits": [
      { "nom": "Poulet entier", "quantite": 1, "prix": 4000 },
      { "nom": "Coca-Cola", "quantite": 1, "prix": 200 }
    ],
    "email_usr": "admin@samina.com"
  }
  ```
* **Processus SQL Prisma Transactionnel** :
  1. Résolution ou création automatique du client (dans la table `Membre`).
  2. Résolution du caissier/admin (dans la table `Utilisateur`).
  3. Lancement de la transaction `$transaction` :
     - Enregistrement de la commande principale.
     - Pour chaque produit sélectionné : récupération de sa clé `id_prd` et insertion de la ligne correspondante dans `DetailCommande` avec calcul du sous-total.

---

### 3.5 Tableau de bord (`/api/dashboard/stats`)

#### `GET /api/dashboard/stats`
Calcule les compteurs globaux et le chiffre d'affaires cumulé.
* **Requêtes Prisma** :
  ```javascript
  const productsCount = await prisma.produit.count();
  const membersCount = await prisma.membre.count();
  const ordersCount = await prisma.commande.count();
  const orders = await prisma.commande.findMany({ select: { prix_total: true } });
  const revenue = orders.reduce((sum, o) => sum + Number(o.prix_total), 0);
  ```

---

## 4. Comment Lancer le Projet

### 4.1 Prérequis
1. Assurez-vous que le service MySQL local est démarré (service Windows `MySQL95`).
2. Créez une base de données vide nommée `dms_db` sur votre serveur MySQL.

### 4.2 Lancement
1. Allez dans le dossier du backend :
   ```bash
   cd .\backend\
   ```
2. Installez les packages :
   ```bash
   npm install
   ```
3. Synchronisez le schéma Prisma et générez le client :
   ```bash
   npx prisma db push
   ```
4. Lancez le serveur :
   ```bash
   npm run dev
   ```
   Le serveur démarrera sur **[http://localhost:3001](http://localhost:3001)** et effectuera un seeding automatique des données de test si votre base MySQL est vide.

5. Ouvrez le fichier frontend dans votre navigateur (ex : double-cliquez sur `index.html` à la racine ou servez-le) et commencez à l'utiliser !
