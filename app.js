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
    console.error("Ошибка загрузки книг:", err);
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
    book.description || "Издание из цифрового собрания AziBax.";

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
    console.error("Ошибка поиска:", err);
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

function openModal() {
  if (authModal) authModal.classList.remove("hidden");
}

function closeModal() {
  if (authModal) authModal.classList.add("hidden");
}

async function handleRegister(e) {
  e.preventDefault();

  if (!authMessage) return;

  const fullName = document.getElementById("registerName")?.value.trim() || "";
  const email = document.getElementById("registerEmail")?.value.trim() || "";
  const password = document.getElementById("registerPassword")?.value.trim() || "";

  if (!email || !password) {
    authMessage.textContent = "Заполни почту и пароль.";
    return;
  }

  authMessage.textContent = "Создаём аккаунт...";

  try {
    const res = await fetch(`${window.AZIBAX_API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password
      })
    });

    let data = null;

    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }

    if (!res.ok) {
      authMessage.textContent = data?.detail || "Ошибка регистрации";
      return;
    }

    authMessage.textContent = "Аккаунт создан. Теперь можно войти.";

    const loginTab = document.querySelector('.tab[data-tab="login"]');
    const registerTab = document.querySelector('.tab[data-tab="register"]');

    if (loginTab && registerTab && loginForm && registerForm) {
      registerTab.classList.remove("active");
      loginTab.classList.add("active");
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    }

    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");

    if (loginEmail) loginEmail.value = email;
    if (loginPassword) loginPassword.value = password;
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    authMessage.textContent = "Load failed";
  }
}

async function handleLogin(e) {
  e.preventDefault();

  if (!authMessage) return;

  const email = document.getElementById("loginEmail")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value.trim() || "";

  if (!email || !password) {
    authMessage.textContent = "Заполни почту и пароль.";
    return;
  }

  authMessage.textContent = "Выполняем вход...";

  try {
    const res = await fetch(`${window.AZIBAX_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    let data = null;

    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }

    if (!res.ok) {
      authMessage.textContent = data?.detail || "Ошибка входа";
      return;
    }

    if (data?.access_token) {
      setToken(data.access_token);
    }

    authMessage.textContent = "Добро пожаловать.";
    updateAuthButton();

    setTimeout(() => {
      closeModal();
    }, 600);
  } catch (err) {
    console.error("Ошибка входа:", err);
    authMessage.textContent = "Load failed";
  }
}

function initAuthModal() {
  if (!authModal) return;

  if (openAuthBtn) {
    openAuthBtn.addEventListener("click", openModal);
  }

  if (closeAuthBtn) {
    closeAuthBtn.addEventListener("click", closeModal);
  }

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
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
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
