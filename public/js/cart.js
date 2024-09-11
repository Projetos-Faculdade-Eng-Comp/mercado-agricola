function saveCartToLocalStorage(userEmail, cart) {
  if (userEmail) {
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
  }
}

function getCartFromLocalStorage(userEmail) {
  const cart = localStorage.getItem(`cart_${userEmail}`);
  return cart ? JSON.parse(cart) : [];
}

function addToCart(userEmail, product, price) {
  if (!userEmail) {
    alert("Você precisa estar logado para adicionar itens ao carrinho.");
    return;
  }

  let cart = getCartFromLocalStorage(userEmail);

  const existingProduct = cart.find((item) => item.product === product);

  if (existingProduct) {
    existingProduct.price = price;
  } else {
    cart.push({ product, price });
  }

  saveCartToLocalStorage(userEmail, cart);

  alert("Produto adicionado ao carrinho!");
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
