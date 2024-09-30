// api/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Listar produtos
router.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "../data/products.json"), "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar produtos.");
    const products = JSON.parse(data);
    res.status(200).json(products);
  });
});

// Cadastrar novo produto
router.post("/", (req, res) => {
  const { name, description, price } = req.body;
  fs.readFile(path.join(__dirname, "../data/products.json"), "utf8", (err, data) => {
    let products = [];
    if (!err) {
      products = JSON.parse(data);
    }
    products.push({ name, description, price });
    fs.writeFile(path.join(__dirname, "../data/products.json"), JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar produto.");
      res.status(200).send("Produto cadastrado com sucesso!");
    });
  });
});

module.exports = router;
