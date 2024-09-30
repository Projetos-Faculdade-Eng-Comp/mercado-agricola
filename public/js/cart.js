function addToCart(userEmail, product, price, quantity) {
  if (!userEmail) {
    alert("Você precisa estar logado para adicionar itens ao carrinho.");
    return;
  }

  fetch("/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: userEmail, product, price, quantity }), // Envia também a quantidade
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Produto adicionado ao carrinho!");
      } else {
        alert("Erro ao adicionar produto ao carrinho.");
      }
    })
    .catch((error) => console.error("Erro:", error));
}

// Atualiza o event listener para incluir a quantidade
document.querySelectorAll(".cart-icon").forEach(button => {
  button.addEventListener("click", function() {
    const product = this.dataset.product;
    const price = this.dataset.price;
    const quantity = document.querySelector(`#quantity-${product}`).value; // Obter a quantidade

    addToCart(document.body.dataset.userEmail, product, price, quantity); // Chama a função com os parâmetros
  });
});
