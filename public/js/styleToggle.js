document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-style");
  const mainStylesLink = document.getElementById("main-styles");
  const pageStylesLink = document.getElementById("page-styles");

  let isUsingCssALT = localStorage.getItem("useCssALT") === "true";

  function applyStyles() {
    if (isUsingCssALT) {
      mainStylesLink.href = "cssALT/styles.css";
      pageStylesLink.href = pageStylesLink.href.replace("css/", "cssALT/");
    } else {
      mainStylesLink.href = "css/styles.css";
      pageStylesLink.href = pageStylesLink.href.replace("cssALT/", "css/");
    }
  }

  function toggleStyles() {
    isUsingCssALT = !isUsingCssALT;
    applyStyles();
    localStorage.setItem("useCssALT", isUsingCssALT);
  }

  applyStyles();

  if (toggleButton) {
    toggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      toggleStyles();
    });
  }
});
