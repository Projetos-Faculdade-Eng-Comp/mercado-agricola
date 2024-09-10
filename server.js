const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuração do Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configuração do express-session
app.use(
  session({
    secret: "mysecret", // Altere para uma chave secreta em produção
    resave: false,
    saveUninitialized: true,
  })
);

// Rota para exibir o formulário de cadastro
app.get("/signUp", (req, res) => {
  const successMsg = req.session.successMsg || null;
  const errorMsg = req.session.errorMsg || null;
  req.session.successMsg = null;
  req.session.errorMsg = null;
  res.render("signUp", { successMsg, errorMsg });
});

// Rota para processar o formulário de cadastro
app.post("/signUp", (req, res) => {
  const { primeiroNome, ultimoNome, email, senha, confirmSenha, perfil } =
    req.body;

  if (senha !== confirmSenha) {
    req.session.errorMsg = "As senhas não coincidem.";
    return res.redirect("/signUp");
  }

  // Lê o arquivo data/users.json
  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Se o arquivo não existir, cria um novo array
        let users = [];
        users.push({ primeiroNome, ultimoNome, email, senha, perfil });

        // Salva o arquivo data/users.json
        fs.writeFile(
          "data/users.json",
          JSON.stringify(users, null, 2),
          (err) => {
            if (err) throw err;
            req.session.successMsg = "Cadastro realizado com sucesso!";
            res.redirect("/signUp");
          }
        );
      } else {
        throw err;
      }
    } else {
      let users = JSON.parse(data);

      // Adiciona novo usuário
      users.push({ primeiroNome, ultimoNome, email, senha, perfil });

      // Salva o arquivo data/users.json
      fs.writeFile("data/users.json", JSON.stringify(users, null, 2), (err) => {
        if (err) throw err;
        req.session.successMsg = "Cadastro realizado com sucesso!";
        res.redirect("/signUp");
      });
    }
  });
});

// Rota para exibir a página de login
app.get("/login", (req, res) => {
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null;
  res.render("login", { errorMsg });
});

// Rota para processar o login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  // Lê o arquivo data/users.json
  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) throw err;

    let users = JSON.parse(data);
    let user = users.find(
      (user) => user.email === email && user.senha === senha
    );

    if (user) {
      req.session.user = user;
      res.redirect("/");
    } else {
      req.session.errorMsg = "E-mail ou senha incorretos. Tente novamente.";
      res.redirect("/login");
    }
  });
});

// Rota para a página inicial (index)
app.get("/", (req, res) => {
  const user = req.session.user || null;
  res.render("index", { user });
});

// Rota para a página de produtores
app.get("/producers", (req, res) => {
  const user = req.session.user || null;
  res.render("producers", { user });
});

// Rota para a página de produtos
app.get("/products", (req, res) => {
  const user = req.session.user || null;
  res.render("products", { user });
});

// Rota para logout
app.get("/logout", (req, res) => {
  req.session.destroy(); // Destruir a sessão
  res.redirect("/login");
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
