document.getElementById("logoutBtn")?.addEventListener("click", () => {
  clearToken();
  location.href = "index.html";
});
