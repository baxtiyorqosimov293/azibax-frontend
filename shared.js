const API = window.AZIBAX_API || "https://azibax-backend.onrender.com";

function getToken() {
  return localStorage.getItem("azibax_token") || "";
}

function setToken(token) {
  localStorage.setItem("azibax_token", token);
}

function clearToken() {
  localStorage.removeItem("azibax_token");
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bookLanguage(book) {
  if (!book) return "Книга";
  return book.language || "Книга";
}

function bookLink(book) {
  if (!book) return "#";

  const id = encodeURIComponent(book.id || "");
  const title = encodeURIComponent(book.title || "");
  const author = encodeURIComponent(book.author || "");

  return `reader.html?id=${id}&title=${title}&author=${author}`;
}

function createBookCard(book) {
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
      <a class="book-cover-link" href="${link}">
        <div class="book-cover-shell">
          ${cover}
        </div>
      </a>

      <div class="book-meta">
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>

        <div class="book-bottom">
          <span class="book-chip">${language}</span>
          <a class="book-open-link" href="${link}">
            Читать →
          </a>
        </div>
      </div>
    </article>
  `;
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  let payload = null;

  try {
    payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    if (payload && typeof payload === "object") {
      throw new Error(payload.detail || JSON.stringify(payload));
    }
    throw new Error(payload || "Ошибка запроса");
  }

  return payload;
}
