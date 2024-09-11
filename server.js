const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

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

app.get("/signUp", (req, res) => {
  const successMsg = req.session.successMsg || null;
  const errorMsg = req.session.errorMsg || null;
  req.session.successMsg = null;
  req.session.errorMsg = null;
  res.render("signUp", { successMsg, errorMsg });
});

app.post("/signUp", (req, res) => {
  const { primeiroNome, ultimoNome, email, senha, confirmSenha, perfil } =
    req.body;

  if (senha !== confirmSenha) {
    req.session.errorMsg = "As senhas não coincidem.";
    return res.redirect("/signUp");
  }

  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        let users = [];
        users.push({ primeiroNome, ultimoNome, email, senha, perfil });

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

      users.push({ primeiroNome, ultimoNome, email, senha, perfil });

      fs.writeFile("data/users.json", JSON.stringify(users, null, 2), (err) => {
        if (err) throw err;
        req.session.successMsg = "Cadastro realizado com sucesso!";
        res.redirect("/signUp");
      });
    }
  });
});

app.get("/login", (req, res) => {
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null;
  res.render("login", { errorMsg });
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

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

app.get("/", (req, res) => {
  const user = req.session.user || null;
  res.render("index", { user });
});

app.get("/producers", (req, res) => {
  const user = req.session.user || null;
  res.render("producers", { user });
});

app.get("/products", (req, res) => {
  const user = req.session.user || null;

  fs.readFile("data/products.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao carregar produtos.");
    }

    const products = JSON.parse(data);
    res.render("products", { user, products });
  });
});

app.get("/products/registerProduct", (req, res) => {
  const successMsg = req.session.successMsg || null;
  req.session.successMsg = null;
  res.render("registerProduct", { successMsg });
});

app.post("/products/registerProduct", (req, res) => {
  const { name, description, price } = req.body;

  fs.readFile("data/products.json", "utf8", (err, data) => {
    if (err && err.code === "ENOENT") {
      let products = [];
      products.push({ name, description, price });

      fs.writeFile(
        "data/products.json",
        JSON.stringify(products, null, 2),
        (err) => {
          if (err) throw err;
          req.session.successMsg = "Produto cadastrado com sucesso!";
          res.redirect("/products/registerProduct");
        }
      );
    } else if (err) {
      throw err;
    } else {
      let products = JSON.parse(data);

      products.push({ name, description, price });

      fs.writeFile(
        "data/products.json",
        JSON.stringify(products, null, 2),
        (err) => {
          if (err) throw err;
          req.session.successMsg = "Produto cadastrado com sucesso!";
          res.redirect("/products/registerProduct");
        }
      );
    }
  });
});

app.get("/cart", (req, res) => {
  const user = req.session.user;

  if (!user) {
    req.session.errorMsg = "Faça login para visualizar o carrinho.";
    return res.redirect("/login");
  }

  res.render("cart", { user });
});

app.post("/cart/add", (req, res) => {
  const { email, product, price } = req.body;

  if (!email || !product || !price) {
    return res.status(400).json({ success: false, message: "Dados inválidos" });
  }

  fs.readFile("data/carts.json", "utf8", (err, data) => {
    let carts = {};

    if (!err) {
      carts = JSON.parse(data);
    }

    if (!carts[email]) {
      carts[email] = [];
    }

    const existingProduct = carts[email].find(
      (item) => item.product === product
    );

    if (existingProduct) {
      existingProduct.price = price;
    } else {
      carts[email].push({ product, price });
    }

    fs.writeFile("data/carts.json", JSON.stringify(carts, null, 2), (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Erro ao salvar carrinho" });
      res.json({ success: true });
    });
  });
});

app.get("/cart/items", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "E-mail não fornecido" });
  }

  fs.readFile("data/carts.json", "utf8", (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Erro ao carregar carrinho" });

    const carts = JSON.parse(data);
    const cart = carts[email] || [];

    res.json({ success: true, cart });
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
