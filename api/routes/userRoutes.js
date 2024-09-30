// api/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Rota de cadastro de usuários
router.post("/signUp", (req, res) => {
  const { primeiroNome, ultimoNome, email, senha, perfil } = req.body;

  fs.readFile(path.join(__dirname, "../data/users.json"), "utf8", (err, data) => {
    let users = [];
    if (!err) {
      users = JSON.parse(data);
    }
    users.push({ primeiroNome, ultimoNome, email, senha, perfil });
    fs.writeFile(path.join(__dirname, "../data/users.json"), JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar usuário.");
      res.status(200).send("Cadastro realizado com sucesso!");
    });
  });
});

// Rota de login de usuários
router.post("/login", (req, res) => {
  const { email, senha } = req.body;
  fs.readFile(path.join(__dirname, "../data/users.json"), "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao ler usuários.");
    const users = JSON.parse(data);
    const user = users.find((u) => u.email === email && u.senha === senha);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(400).send("Credenciais inválidas.");
    }
  });
});

module.exports = router;
