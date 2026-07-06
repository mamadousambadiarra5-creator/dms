const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/produits", async (req, res) => {
  const produits = await prisma.produit.findMany();
  res.json(produits);
});

app.post("/produits", async (req, res) => {
  const { nom, description, prix } = req.body;
  const produit = await prisma.produit.create({
    data: { nom, description, prix: Number(prix) },
  });
  res.status(201).json(produit);
});

app.listen(3000, () => {
  console.log("Backend démarré sur http://localhost:3000");
});