const booksGrid = document.getElementById("booksGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogMeta = document.getElementById("catalogMeta");
const refreshBtn = document.getElementById("refreshBtn");
const openAuthBtn = document.getElementById("openAuthBtn");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const tabs = document.querySelectorAll(".tab");
const heroCounter = document.getElementById("heroCounter");

let currentLanguage = "";

async function loadBooks(language = "") {
  try {
    catalogMeta.textContent = "Loading the catalogue...";
    let path = "/books?limit=18";
    if (language) path += `&language=${encodeURIComponent(language)}`;

    const books = await apiFetch(path);
    if (!Array.isArray(books)) throw new Error("API returned an invalid format");

    renderBooks(books);
    catalogMeta.textContent = `Titles displayed: ${books.length}`;
    heroCounter.textContent = `${books.length}+`;
  } catch (err) {
    catalogMeta.textContent = "Connection error";
    booksGrid.innerHTML = `<div class="state-card">${escapeHtml(err.message || "Could not load books")}</div>`;
  }
}

function renderBooks(books) {
  if (!books.length) {
    booksGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");
  booksGrid.innerHTML = books.map(createBookCard).join("");
}

async function searchBooks() {
  try {
    const q = searchInput.value.trim();
    if (!q) {
      await loadBooks(currentLanguage);
      return;
    }

    let path = `/books/search?q=${encodeURIComponent(q)}`;
    if (currentLanguage) path += `&language=${encodeURIComponent(currentLanguage)}`;

    catalogMeta.textContent = `Searching: "${q}"`;
    const books = await apiFetch(path);
    if (!Array.isArray(books)) throw new Error("Search returned an invalid format");

    renderBooks(books);
    catalogMeta.textContent = `Found: ${books.length}`;
  } catch (err) {
    catalogMeta.textContent = "Search error";
    booksGrid.innerHTML = `<div class="state-card">${escapeHtml(err.message || "Search failed")}</div>`;
  }
}

function activateLanguageButtons() {
  document.querySelectorAll(".lang-pill").forEach(btn => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".lang-pill").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      currentLanguage = btn.dataset.language || "";
      searchInput.value = "";
      await loadBooks(currentLanguage);
    });
  });
}

function updateAuthButton() {
  openAuthBtn.textContent = getToken() ? "Signed In" : "Sign In";
}

function initAuthModal() {
  openAuthBtn.addEventListener("click", () => authModal.classList.remove("hidden"));
  closeAuthBtn.addEventListener("click", () => authModal.classList.add("hidden"));

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const isLogin = tab.dataset.tab === "login";
      loginForm.classList.toggle("hidden", !isLogin);
      registerForm.classList.toggle("hidden", isLogin);
      authMessage.textContent = "";
    });
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authMessage.textContent = "Signing in...";
    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: document.getElementById("loginEmail").value.trim(),
          password: document.getElementById("loginPassword").value.trim()
        })
      });
      setToken(result.access_token);
      authMessage.textContent = "Welcome back.";
      updateAuthButton();
      setTimeout(() => authModal.classList.add("hidden"), 600);
    } catch (err) {
      authMessage.textContent = err.message || "Login failed";
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authMessage.textContent = "Creating account...";
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: document.getElementById("registerName").value.trim(),
          email: document.getElementById("registerEmail").value.trim(),
          password: document.getElementById("registerPassword").value.trim()
        })
      });
      authMessage.textContent = "Account created. You may sign in now.";
    } catch (err) {
      authMessage.textContent = err.message || "Registration failed";
    }
  });

  updateAuthButton();
}

searchBtn.addEventListener("click", searchBooks);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBooks();
});
refreshBtn.addEventListener("click", () => loadBooks(currentLanguage));

activateLanguageButtons();
initAuthModal();
loadBooks();
