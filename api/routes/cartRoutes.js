// api/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Adicionar produto ao carrinho
router.post("/add", (req, res) => {
  const { email, product, price } = req.body;
  fs.readFile(path.join(__dirname, "../data/carts.json"), "utf8", (err, data) => {
    let carts = {};
    if (!err) {
      carts = JSON.parse(data);
    }
    if (!carts[email]) {
      carts[email] = [];
    }
    carts[email].push({ product, price });
    fs.writeFile(path.join(__dirname, "../data/carts.json"), JSON.stringify(carts, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar carrinho.");
      res.status(200).send("Produto adicionado ao carrinho.");
    });
  });
});

module.exports = router;
