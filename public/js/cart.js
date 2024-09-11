function addToCart(userEmail, product, price) {
  if (!userEmail) {
    alert("Você precisa estar logado para adicionar itens ao carrinho.");
    return;
  }

  fetch("/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: userEmail, product, price }),
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

document.addEventListener("DOMContentLoaded", () => {
  const userEmail = document.querySelector("body").dataset.userEmail;

  document.querySelectorAll(".cart-icon").forEach((button) => {
    button.addEventListener("click", (event) => {
      const product = event.currentTarget.dataset.product;
      const price = event.currentTarget.dataset.price;
      addToCart(userEmail, product, price);
    });
  });
});
