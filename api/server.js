// api/server.js (Componente C - Servidor da API de dados)
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Cadastro de usuários
app.post("/api/signUp", (req, res) => {
  const { primeiroNome, ultimoNome, email, senha, perfil } = req.body;

  fs.readFile("data/users.json", "utf8", (err, data) => {
    let users = [];
    if (!err) {
      users = JSON.parse(data);
    }
    users.push({ primeiroNome, ultimoNome, email, senha, perfil });
    fs.writeFile("data/users.json", JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar usuário.");
      res.status(200).send("Cadastro realizado com sucesso!");
    });
  });
});

// Login de usuários
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  fs.readFile("data/users.json", "utf8", (err, data) => {
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

app.get("/api/users", (req, res) => {
  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar usuários.");
    const users = JSON.parse(data);
    res.status(200).json(users);
  });
});

app.delete("/api/users/:email", (req, res) => {
  const email = req.params.email;

  fs.readFile("data/users.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar usuários.");

    let users = JSON.parse(data);
    const newUsers = users.filter((user) => user.email !== email);

    if (users.length === newUsers.length) {
      return res.status(404).send("Usuário não encontrado.");
    }

    fs.writeFile(
      "data/users.json",
      JSON.stringify(newUsers, null, 2),
      (err) => {
        if (err) return res.status(500).send("Erro ao excluir usuário.");
        res.status(200).send("Usuário excluído com sucesso.");
      }
    );
  });
});

// Produtos
app.get("/api/products", (req, res) => {
  fs.readFile("data/products.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar produtos.");
    const products = JSON.parse(data);
    res.status(200).json(products);
  });
});

app.post("/api/products", (req, res) => {
  const { name, description, price, imageUrl } = req.body;

  fs.readFile("data/products.json", "utf8", (err, data) => {
    let products = [];
    if (!err) {
      products = JSON.parse(data);
    }
    products.push({ name, description, price, imageUrl }); // Adicionando a URL da imagem
    fs.writeFile(
      "data/products.json",
      JSON.stringify(products, null, 2),
      (err) => {
        if (err) return res.status(500).send("Erro ao salvar produto.");
        res.status(200).send("Produto cadastrado com sucesso!");
      }
    );
  });
});

// Carrinho
app.get("/api/cart", (req, res) => {
  const email = req.query.email; // Obtém o email do query string

  // Lê os dados do carrinho a partir do arquivo JSON
  fs.readFile("data/carts.json", "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao ler o carrinho." });
    }

    const carts = JSON.parse(data); // Converte o JSON lido em objeto

    if (carts[email]) {
      // Se o carrinho para o email existir, retorna os itens
      res.status(200).json({ success: true, cart: carts[email] });
    } else {
      // Se não houver carrinho para o email, retorna uma resposta apropriada
      res
        .status(404)
        .json({ success: false, message: "Carrinho não encontrado." });
    }
  });
});

app.post("/api/cart/add", (req, res) => {
  const { email, product, price, quantity } = req.body;

  fs.readFile("data/carts.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar o carrinho.");

    let carts = JSON.parse(data);
    const userCart = carts[email] || [];

    // Verificar se o produto já está no carrinho
    const existingProduct = userCart.find((item) => item.product === product);
    if (existingProduct) {
      // Atualizar a quantidade do produto existente
      existingProduct.quantity += parseInt(quantity);
    } else {
      // Adicionar novo produto
      userCart.push({ product, price, quantity: parseInt(quantity) });
    }

    carts[email] = userCart;

    fs.writeFile("data/carts.json", JSON.stringify(carts, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar o carrinho.");
      res.status(200).send("Produto adicionado ao carrinho!");
    });
  });
});

app.get("/api/cart/:email", (req, res) => {
  const email = req.params.email;

  fs.readFile("data/carts.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao ler o carrinho.");
    const carts = JSON.parse(data);

    if (carts[email]) {
      res.status(200).json({ success: true, cart: carts[email] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Carrinho não encontrado." });
    }
  });
});

app.post("/api/cart/delete", (req, res) => {
  const { email, product } = req.body;

  // Ler o arquivo JSON do carrinho
  fs.readFile("data/carts.json", "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Erro ao ler o carrinho." });
    }

    let carts = JSON.parse(data);

    if (carts[email]) {
      // Filtra o carrinho para remover o produto correspondente
      carts[email] = carts[email].filter((item) => item.product !== product);

      // Escreve de volta no arquivo JSON
      fs.writeFile("data/carts.json", JSON.stringify(carts, null, 2), (err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Erro ao salvar o carrinho." });
        }
        res
          .status(200)
          .json({ success: true, message: "Produto removido com sucesso." });
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Carrinho não encontrado." });
    }
  });
});

// Produtores
app.get("/api/producers", (req, res) => {
  fs.readFile("data/producers.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar produtores.");
    const producers = JSON.parse(data);
    res.status(200).json(producers);
  });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
