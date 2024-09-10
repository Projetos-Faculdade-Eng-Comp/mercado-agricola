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
  req.session.successMsg = null; // Limpa a mensagem de sucesso após a exibição
  req.session.errorMsg = null; // Limpa a mensagem de erro após a exibição
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

  // Lê o arquivo data/usuarios.json
  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Se o arquivo não existir, cria um novo array
        let usuarios = [];
        usuarios.push({ primeiroNome, ultimoNome, email, senha, perfil });

        // Salva o arquivo data/usuarios.json
        fs.writeFile(
          "data/users.json",
          JSON.stringify(usuarios, null, 2),
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
      let usuarios = JSON.parse(data);

      // Adiciona novo usuário
      usuarios.push({ primeiroNome, ultimoNome, email, senha, perfil });

      // Salva o arquivo data/usuarios.json
      fs.writeFile(
        "data/users.json",
        JSON.stringify(usuarios, null, 2),
        (err) => {
          if (err) throw err;
          req.session.successMsg = "Cadastro realizado com sucesso!";
          res.redirect("/signUp");
        }
      );
    }
  });
});

// Rota para exibir a página de login
app.get("/login", (req, res) => {
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null; // Limpa a mensagem de erro após a exibição
  res.render("login", { errorMsg });
});

// Rota para processar o login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  // Lê o arquivo data/usuarios.json
  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) throw err;

    let usuarios = JSON.parse(data);
    let usuario = usuarios.find(
      (user) => user.email === email && user.senha === senha
    );

    if (usuario) {
      res.send("Login realizado com sucesso!");
    } else {
      req.session.errorMsg = "E-mail ou senha incorretos. Tente novamente.";
      res.redirect("/login");
    }
  });
});

// Rota para a página inicial (index)
app.get("/", (req, res) => {
  res.render("index");
});

// Rota para a página de produtores
app.get("/producers", (req, res) => {
  res.render("producers");
});

// Rota para a página de produtos
app.get("/products", (req, res) => {
  res.render("products");
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
