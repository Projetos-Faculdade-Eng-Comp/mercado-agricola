// server.js (Componente B - Servidor de arquivos estáticos e templates)
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Rotas de renderização de templates
app.get("/signUp", (req, res) => {
  const successMsg = req.session.successMsg || null;
  const errorMsg = req.session.errorMsg || null;
  req.session.successMsg = null;
  req.session.errorMsg = null;
  res.render("signUp", { successMsg, errorMsg });
});

app.post("/signUp", async (req, res) => {
  const { primeiroNome, ultimoNome, email, senha, perfil } = req.body;
  try {
    await axios.post("http://localhost:3001/api/signUp", { primeiroNome, ultimoNome, email, senha, perfil });
    req.session.successMsg = "Cadastro realizado com sucesso!";
    res.redirect("/signUp");
  } catch (error) {
    req.session.errorMsg = "Erro ao cadastrar usuário.";
    res.redirect("/signUp");
  }
});

app.get("/login", (req, res) => {
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null;
  res.render("login", { errorMsg });
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const response = await axios.post("http://localhost:3001/api/login", { email, senha });
    req.session.user = response.data; // Salva o usuário na sessão
    res.redirect("/");
  } catch (error) {
    req.session.errorMsg = "Credenciais inválidas.";
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  const user = req.session.user || null;
  res.render("index", { user });
});

app.get("/admin/users", async (req, res) => {
  const user = req.session.user;

  if (!user || user.perfil !== "admin") {
    return res.status(403).send("Acesso negado");
  }

  try {
    const response = await axios.get("http://localhost:3001/api/users");
    const users = response.data;

    res.render("usersList", { user, users });
  } catch (error) {
    req.session.errorMsg = "Erro ao carregar usuários.";
    res.redirect("/");
  }
});

app.delete("/admin/users/:email", async (req, res) => {
  const user = req.session.user;

  if (!user || user.perfil !== "admin") {
    return res.status(403).send("Acesso negado");
  }

  const email = req.params.email;

  try {
    const response = await axios.delete(`http://localhost:3001/api/users/${email}`);
    res.status(200).send("Usuário excluído com sucesso!");
  } catch (error) {
    res.status(500).send("Erro ao excluir usuário.");
  }
});

app.get("/producers", async (req, res) => {
  const user = req.session.user || null;
  
  try {
    const response = await axios.get("http://localhost:3001/api/producers"); // Chamada para a API
    const producers = response.data; // O array de produtores retornado pela API

    res.render("producers", { user, producers }); // Renderiza a página com os dados dos produtores
  } catch (error) {
    req.session.errorMsg = "Erro ao carregar produtores.";
    res.redirect("/");
  }
});

app.get("/products", async (req, res) => {
  const user = req.session.user || null;
  const response = await axios.get("http://localhost:3001/api/products");
  const products = response.data; // O array de produtos retornado pela API

  res.render("products", { user, products });
});

app.get("/products/registerProduct", (req, res) => {
  const successMsg = req.session.successMsg || null;
  req.session.successMsg = null;
  res.render("registerProduct", { successMsg });
});

app.post("/products/registerProduct", async (req, res) => {
  const { name, description, price } = req.body;

  try {
    await axios.post("http://localhost:3001/api/products", { name, description, price });
    req.session.successMsg = "Produto cadastrado com sucesso!";
    res.redirect("/products/registerProduct");
  } catch (error) {
    req.session.errorMsg = "Erro ao cadastrar produto.";
    res.redirect("/products/registerProduct");
  }
});

app.get("/cart", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    req.session.errorMsg = "Faça login para visualizar o carrinho.";
    return res.redirect("/login");
  }

  // Obtenha as mensagens de erro e sucesso, se existirem
  const errorMsg = req.session.errorMsg || null;
  const successMsg = req.session.successMsg || null;
  
  // Limpe as mensagens após a leitura
  req.session.errorMsg = null;
  req.session.successMsg = null;

  try {
    const response = await axios.get(`http://localhost:3001/api/cart?email=${user.email}`);
    const cartItems = response.data.cart;

    res.render("cart", { user, cartItems, errorMsg, successMsg });
  } catch (error) {
    req.session.errorMsg = "Erro ao carregar o carrinho.";
    res.redirect("/");
  }
});

// Rota para adicionar produto ao carrinho
app.post("/cart/add", async (req, res) => {
  const { product, price } = req.body;
  const user = req.session.user;

  if (!user) {
    req.session.errorMsg = "Faça login para adicionar produtos ao carrinho.";
    return res.redirect("/login");
  }

  try {
    await axios.post("http://localhost:3001/api/cart/add", { email: user.email, product, price });
    req.session.successMsg = "Produto adicionado ao carrinho.";
    res.redirect("/cart");
  } catch (error) {
    req.session.errorMsg = "Erro ao adicionar produto ao carrinho.";
    res.redirect("/cart");
  }
});

app.get("/cart/items", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "E-mail não fornecido" });
  }

  fetch(`http://localhost:3001/api/cart/${email}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        res.json(data); // Retorna os dados recebidos da API para o cliente
      } else {
        res.status(500).json({ success: false, message: "Erro ao carregar o carrinho." });
      }
    })
    .catch(error => {
      console.error("Erro ao buscar itens do carrinho:", error);
      res.status(500).json({ success: false, message: "Erro ao carregar o carrinho." });
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Servidor estático rodando na porta ${PORT}`);
});
