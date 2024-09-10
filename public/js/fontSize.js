document.addEventListener("DOMContentLoaded", () => {
  const increaseFontBtn = document.getElementById("increase-font");
  const decreaseFontBtn = document.getElementById("decrease-font");

  const defaultFontSizes = {
    ".navbar .logo h1": "30px",
    ".navbar .nav-links li a": "25px",
    ".navbar .nav-icons a": "30px",
    ".home-img-section .img-section-content i": "50px",
    ".home-img-section .img-section-content h2": "50px",
    ".home-img-section .img-section-content p": "25px",
    ".home-img-section .img-section-content button": "25px",
    ".home-product-section h2": "50px",
    ".home-product-section p": "25px",
    ".home-product-section .product-card h3": "30px",
    ".home-product-section .product-card p": "20px",
    ".home-product-section button": "30px",
    ".producer-section h2": "24px",
    ".producer-section .producer-table th": "18px",
    ".producer-section .producer-table td": "18px",
    ".products-section .filters h3": "24px",
    ".products-section .filters ul li label": "18px",
    ".products-section .products-content .search-bar input": "18px",
    ".products-section .products-content .products-view .product-card h3":
      "24px",
    ".products-section .products-content .products-view .product-card p":
      "20px",
    ".products-section .products-content .products-view .product-card .cart-icon":
      "25px",
    ".footer p": "16px",
  };

  function initializeLocalStorage() {
    if (!localStorage.getItem("fontSizeSettings")) {
      localStorage.setItem(
        "fontSizeSettings",
        JSON.stringify(defaultFontSizes)
      );
    }
  }

  function loadFontSizes() {
    return (
      JSON.parse(localStorage.getItem("fontSizeSettings")) || defaultFontSizes
    );
  }

  function applyFontSizes(fontSizes) {
    for (let selector in fontSizes) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.fontSize = fontSizes[selector];
      });
    }
  }

  function adjustFontSizes(adjustment) {
    const fontSizeSettings = loadFontSizes();
    for (let selector in fontSizeSettings) {
      const baseSize = parseFloat(defaultFontSizes[selector]);
      const currentSize = parseFloat(fontSizeSettings[selector]);
      let newSize = currentSize + adjustment;

      newSize = Math.max(baseSize - 2 * 5, Math.min(baseSize + 2 * 5, newSize));
      fontSizeSettings[selector] = `${newSize}px`;
    }
    localStorage.setItem("fontSizeSettings", JSON.stringify(fontSizeSettings));
    applyFontSizes(fontSizeSettings);
  }

  initializeLocalStorage();
  applyFontSizes(loadFontSizes());

  increaseFontBtn.addEventListener("click", (event) => {
    event.preventDefault();
    adjustFontSizes(5);
  });

  decreaseFontBtn.addEventListener("click", (event) => {
    event.preventDefault();
    adjustFontSizes(-5);
  });
});
