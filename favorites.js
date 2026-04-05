const logoutBtn = document.getElementById("logoutBtn");
const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesEmpty = document.getElementById("favoritesEmpty");
const favoritesMeta = document.getElementById("favoritesMeta");

logoutBtn?.addEventListener("click", () => {
  clearToken();
  location.href = "index.html";
});

function getLocalFavorites() {
  try {
    return JSON.parse(localStorage.getItem("azibax_local_favorites") || "[]");
  } catch {
    return [];
  }
}

function setLocalFavorites(items) {
  localStorage.setItem("azibax_local_favorites", JSON.stringify(items));
}

function addFavorite(book) {
  const items = getLocalFavorites();
  const exists = items.some(item => item.id === book.id);

  if (!exists) {
    items.unshift(book);
    setLocalFavorites(items);
  }
}

function removeFavorite(bookId) {
  const items = getLocalFavorites().filter(item => item.id !== bookId);
  setLocalFavorites(items);
  renderFavorites();
}

function createFavoriteCard(book) {
  const title = escapeHtml(book?.title || "Без названия");
  const author = escapeHtml(book?.author || "Неизвестный автор");
  const language = escapeHtml(bookLanguage(book));
  const link = bookLink(book);

  const cover = book?.cover
    ? `
      <img
        class="book-cover-image"
        src="${book.cover}"
        alt="${title}"
        loading="lazy"
      >
    `
    : `
      <div class="book-cover-fallback">
        <div class="crest-mini">AZBX</div>
        <div class="fallback-line"></div>
        <div class="fallback-label">${language}</div>
      </div>
    `;

  return `
    <article class="book-card">
      <a class="book-cover-link" href="${link}" target="_blank" rel="noopener noreferrer">
        <div class="book-cover-shell">
          ${cover}
        </div>
      </a>

      <div class="book-meta">
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>

        <div class="book-bottom">
          <span class="book-chip">${language}</span>
          <button class="ghost-button small remove-favorite-btn" data-book-id="${escapeHtml(book.id)}">
            Убрать
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFavorites() {
  const items = getLocalFavorites();

  if (favoritesMeta) {
    favoritesMeta.textContent = items.length
      ? `Книг в личном собрании: ${items.length}`
      : "Здесь будут сохранённые книги и личные подборки.";
  }

  if (!items.length) {
    if (favoritesGrid) favoritesGrid.innerHTML = "";
    favoritesEmpty?.classList.remove("hidden");
    return;
  }

  favoritesEmpty?.classList.add("hidden");

  if (favoritesGrid) {
    favoritesGrid.innerHTML = items.map(createFavoriteCard).join("");

    document.querySelectorAll(".remove-favorite-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        removeFavorite(btn.dataset.bookId);
      });
    });
  }
}

renderFavorites();
