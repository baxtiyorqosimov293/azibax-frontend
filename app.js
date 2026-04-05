const booksGrid = document.getElementById("booksGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogMeta = document.getElementById("catalogMeta");
const refreshBtn = document.getElementById("refreshBtn");
const heroBookCount = document.getElementById("heroBookCount");
let currentGenre = "";

async function loadBooks(genre = "") {
  try {
    catalogMeta.textContent = "Загрузка каталога...";
    let path = "/books?limit=20";
    if (genre) path += `&genre=${encodeURIComponent(genre)}`;

    const books = await apiFetch(path);

    if (!Array.isArray(books)) {
      throw new Error("API вернул не список книг");
    }

    renderBooks(books);
    catalogMeta.textContent = `Показано книг: ${books.length}`;
    heroBookCount.textContent = `${books.length}+`;
  } catch (err) {
    catalogMeta.textContent = "Ошибка подключения к API";
    booksGrid.innerHTML = `<div class="empty-card">${err.message || "Не удалось загрузить книги"}</div>`;
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
      await loadBooks(currentGenre);
      return;
    }

    catalogMeta.textContent = `Поиск: "${q}"`;
    const books = await apiFetch(`/books/search?q=${encodeURIComponent(q)}`);

    if (!Array.isArray(books)) {
      throw new Error("Поиск вернул неверный формат");
    }

    renderBooks(books);
    catalogMeta.textContent = `Найдено книг: ${books.length}`;
  } catch (err) {
    catalogMeta.textContent = "Ошибка поиска";
    booksGrid.innerHTML = `<div class="empty-card">${err.message || "Не удалось выполнить поиск"}</div>`;
  }
}

function activateGenreButtons() {
  document.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      currentGenre = btn.dataset.genre || "";
      searchInput.value = "";
      await loadBooks(currentGenre);
    });
  });
}

function initAuthModal() {
  const modal = document.getElementById("authModal");
  const openBtn = document.getElementById("openAuthBtn");
  const closeBtn = document.getElementById("closeAuthBtn");
  const tabs = document.querySelectorAll(".tab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  const updateButton = () => {
    openBtn.textContent = getToken() ? "Вы вошли" : "Войти";
  };

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

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
    authMessage.textContent = "Входим...";

    try {
      const body = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value.trim()
      };

      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
      });

      setToken(result.access_token);
      authMessage.textContent = "Успешный вход";
      updateButton();
      setTimeout(() => modal.classList.add("hidden"), 500);
    } catch (err) {
      authMessage.textContent = err.message || "Ошибка входа";
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authMessage.textContent = "Создаем аккаунт...";

    try {
      const body = {
        full_name: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: document.getElementById("registerPassword").value.trim()
      };

      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(body)
      });

      authMessage.textContent = "Аккаунт создан. Теперь войди.";
    } catch (err) {
      authMessage.textContent = err.message || "Ошибка регистрации";
    }
  });

  updateButton();
}

searchBtn.addEventListener("click", searchBooks);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBooks();
});
refreshBtn.addEventListener("click", () => loadBooks(currentGenre));

activateGenreButtons();
initAuthModal();
loadBooks();
