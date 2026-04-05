const booksGrid = document.getElementById("booksGrid");
const recommendedGrid = document.getElementById("recommendedGrid");
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
const featuredTitle = document.getElementById("featuredTitle");
const featuredAuthor = document.getElementById("featuredAuthor");
const featuredDescription = document.getElementById("featuredDescription");
const featuredCover = document.getElementById("featuredCover");

let currentLanguage = "";
let currentBooks = [];

async function loadBooks(language = "") {
  try {
    catalogMeta.textContent = "Загрузка каталога...";

    let path = "/books?limit=18";
    if (language) {
      path += `&language=${encodeURIComponent(language)}`;
    }

    const books = await apiFetch(path);

    if (!Array.isArray(books)) {
      throw new Error("Неверный формат ответа API");
    }

    currentBooks = books;

    renderFeaturedBook(books[0] || null);
    renderRecommendedBooks(books.slice(1, 5));
    renderBooks(books);

    catalogMeta.textContent = `Книг в выдаче: ${books.length}`;
    if (heroCounter) {
      heroCounter.textContent = `${books.length}+`;
    }
  } catch (err) {
    catalogMeta.textContent = "Ошибка подключения к API";
    if (booksGrid) {
      booksGrid.innerHTML = `<div class="state-card">${escapeHtml(err.message || "Не удалось загрузить книги")}</div>`;
    }
    if (recommendedGrid) {
      recommendedGrid.innerHTML = "";
    }
    renderFeaturedBook(null);
  }
}

function renderFeaturedBook(book) {
  if (!featuredTitle || !featuredAuthor || !featuredDescription || !featuredCover) return;

  if (!book) {
    featuredTitle.textContent = "Книги, к которым возвращаются.";
    featuredAuthor.textContent = "Спокойное чтение. Выдержанный вкус.";
    featuredDescription.textContent =
      "Русские, узбекские и английские издания в спокойном цифровом пространстве для тех, кто читает не спеша.";

    featuredCover.innerHTML = `
      <div class="featured-cover-inner">
        <div class="featured-cover-top">Печать библиотеки</div>
        <div class="featured-cover-title">AziBax</div>
        <div class="featured-cover-line"></div>
        <div class="featured-cover-text">Частное книжное собрание</div>
      </div>
    `;
    return;
  }

  featuredTitle.textContent = book.title || "Без названия";
  featuredAuthor.textContent = book.author || "Неизвестный автор";
  featuredDescription.textContent =
    book.description ||
    "Издание из цифрового собрания AziBax.";

  if (book.cover) {
    featuredCover.innerHTML = `
      <img
        src="${book.cover}"
        alt="${escapeHtml(book.title || "Книга")}"
        style="width:100%;height:100%;object-fit:cover;display:block;border-radius:24px;"
      >
    `;
  } else {
    featuredCover.innerHTML = `
      <div class="featured-cover-inner">
        <div class="featured-cover-top">${escapeHtml(book.language || "Собрание")}</div>
        <div class="featured-cover-title">${escapeHtml(book.title || "AziBax")}</div>
        <div class="featured-cover-line"></div>
        <div class="featured-cover-text">${escapeHtml(book.author || "Неизвестный автор")}</div>
      </div>
    `;
  }
}

function renderRecommendedBooks(books) {
  if (!recommendedGrid) return;

  if (!books.length) {
    recommendedGrid.innerHTML = "";
    return;
  }

  recommendedGrid.innerHTML = books.map(createBookCard).join("");
}

function renderBooks(books) {
  if (!booksGrid || !emptyState) return;

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
    if (currentLanguage) {
      path += `&language=${encodeURIComponent(currentLanguage)}`;
    }

    catalogMeta.textContent = `Поиск: "${q}"`;

    const books = await apiFetch(path);

    if (!Array.isArray(books)) {
      throw new Error("Поиск вернул неверный формат");
    }

    currentBooks = books;

    renderFeaturedBook(books[0] || null);
    renderRecommendedBooks(books.slice(1, 5));
    renderBooks(books);

    catalogMeta.textContent = `Найдено: ${books.length}`;
    if (heroCounter) {
      heroCounter.textContent = `${books.length}+`;
    }
  } catch (err) {
    catalogMeta.textContent = "Ошибка поиска";
    if (booksGrid) {
      booksGrid.innerHTML = `<div class="state-card">${escapeHtml(err.message || "Не удалось выполнить поиск")}</div>`;
    }
    if (recommendedGrid) {
      recommendedGrid.innerHTML = "";
    }
  }
}

function activateLanguageButtons() {
  document.querySelectorAll(".lang-pill").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".lang-pill").forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");

      currentLanguage = btn.dataset.language || "";
      if (searchInput) {
        searchInput.value = "";
      }

      await loadBooks(currentLanguage);
    });
  });
}

function activateClubButtons() {
  document.querySelectorAll(".club-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".club-pill").forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function updateAuthButton() {
  if (!openAuthBtn) return;
  openAuthBtn.textContent = getToken() ? "Вход выполнен" : "Войти";
}

function initAuthModal() {
  if (!openAuthBtn || !closeAuthBtn || !authModal) return;

  openAuthBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
  });

  closeAuthBtn.addEventListener("click", () => {
    authModal.classList.add("hidden");
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const isLogin = tab.dataset.tab === "login";
      if (loginForm) loginForm.classList.toggle("hidden", !isLogin);
      if (registerForm) registerForm.classList.toggle("hidden", isLogin);
      if (authMessage) authMessage.textContent = "";
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (authMessage) authMessage.textContent = "Выполняем вход...";

      try {
        const result = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: document.getElementById("loginEmail").value.trim(),
            password: document.getElementById("loginPassword").value.trim()
          })
        });

        setToken(result.access_token);
        if (authMessage) authMessage.textContent = "Добро пожаловать.";
        updateAuthButton();

        setTimeout(() => {
          authModal.classList.add("hidden");
        }, 600);
      } catch (err) {
        if (authMessage) authMessage.textContent = err.message || "Ошибка входа";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (authMessage) authMessage.textContent = "Создаём аккаунт...";

      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            full_name: document.getElementById("registerName").value.trim(),
            email: document.getElementById("registerEmail").value.trim(),
            password: document.getElementById("registerPassword").value.trim()
          })
        });

        if (authMessage) authMessage.textContent = "Аккаунт создан. Теперь можно войти.";
      } catch (err) {
        if (authMessage) authMessage.textContent = err.message || "Ошибка регистрации";
      }
    });
  }

  updateAuthButton();
}

if (searchBtn) {
  searchBtn.addEventListener("click", searchBooks);
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBooks();
    }
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => loadBooks(currentLanguage));
}

activateLanguageButtons();
activateClubButtons();
initAuthModal();
loadBooks();
