# Déploiement de l’application DMS sur Vercel

Ce document explique comment déployer votre application avec :
- le frontend sur Vercel
- le backend sur Vercel aussi
- la base MySQL sur un service externe

---

## 1. Architecture demandée

- Frontend : Vercel
- Backend : Vercel
- Base de données : MySQL externe

C’est possible, mais il faut adapter le backend pour qu’il fonctionne correctement dans l’environnement Vercel.

---

## 2. Prérequis

Avant de commencer, il faut avoir :
- un dépôt GitHub avec votre projet
- un compte Vercel
- une base MySQL externe
- une URL de connexion MySQL valide

---

## 3. Structure à préparer

Votre projet doit être organisé de façon à pouvoir être déployé sur Vercel comme un projet full-stack.

### Idéalement
- le frontend reste dans la racine du projet
- le backend est placé dans un dossier séparé, par exemple backend
- Vercel sert le frontend et expose aussi les routes API

---

## 4. Déployer le frontend sur Vercel

### Étapes
1. Pousser votre projet sur GitHub.
2. Se connecter à Vercel.
3. Cliquer sur New Project.
4. Importer le dépôt GitHub.
5. Sélectionner la racine du projet.
6. Déployer.

### Résultat
Votre interface sera accessible via une URL du type :
- https://nom-de-votre-projet.vercel.app

---

## 5. Déployer le backend sur Vercel

Pour que votre backend fonctionne sur Vercel, il faut l’adapter.

### Option simple
Le backend Express peut être transformé en API Vercel avec des fichiers dans un dossier api.

### Ce qu’il faut faire
- créer une structure Vercel compatible
- exposer les routes sous forme de fonctions serverless
- utiliser les variables d’environnement

### Variables d’environnement à définir dans Vercel
Dans les paramètres du projet Vercel, ajoutez :

```env
DATABASE_URL="mysql://utilisateur:motdepasse@host:3306/nom_base"
```

### Important
Vercel ne fonctionne pas comme un serveur Node classique permanent.
Donc votre backend doit être pensé pour des fonctions serverless.

---

## 6. Base MySQL externe

Votre base doit être hébergée ailleurs.

### Exemples de fournisseurs
- Railway MySQL
- PlanetScale
- Clever Cloud
- VPS avec MySQL
- Aiven

### URL de connexion attendue

```env
DATABASE_URL="mysql://user:password@host:3306/dbname"
```

---

## 7. Prisma avec Vercel

Prisma doit fonctionner avec votre base externe.

### Commandes à exécuter localement
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### Important
La base MySQL externe doit déjà contenir les tables avant que l’API ne soit utilisée.

---

## 8. Relier le frontend au backend

Votre frontend doit appeler l’URL publique du backend déployé.

### Exemple
Au lieu de :
```js
http://localhost:3001/api
```

Utilisez :
```js
https://votre-projet.vercel.app/api
```

ou, si vous avez une API séparée :
```js
https://votre-api.vercel.app/api
```

### Méthode pratique
Vous pouvez définir l’URL dans :
```js
localStorage.setItem("API_URL", "https://votre-url.vercel.app/api");
```

---

## 9. Tester la communication

### Test du backend
Essayez d’ouvrir une route API dans le navigateur ou Postman.

Exemple :
```text
https://votre-url.vercel.app/api/health
```

Si tout est correct, vous devriez recevoir une réponse JSON.

### Test du frontend
Ouvrez votre interface Vercel et essayez de vous connecter ou de charger les produits.

---

## 10. Ce qu’il faut savoir sur Vercel

### Ce qui marche bien
- le frontend statique
- les API Vercel simples
- les applications full-stack avec fonctions serverless

### Ce qui demande plus d’adaptation
- Express classique
- Prisma en mode serveur long
- certaines connexions de base qui doivent être bien gérées

---

## 11. Recommandation finale

Si vous voulez absolument tout mettre sur Vercel, la meilleure approche est :

1. Déployer le frontend sur Vercel.
2. Adapter le backend en API Vercel.
3. Connecter la base MySQL externe via DATABASE_URL.
4. Faire pointer le frontend vers l’URL API Vercel.

---

## 12. Résumé

Oui, vous pouvez mettre le front et le back sur Vercel, mais le backend doit être adapté pour Vercel.

La base MySQL reste externe.

C’est la solution la plus cohérente si vous voulez un déploiement “tout Vercel”.
