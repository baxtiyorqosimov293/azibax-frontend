const API = window.AZIBAX_API;

function getToken(){
  return localStorage.getItem("azibax_token") || "";
}

function setToken(token){
  localStorage.setItem("azibax_token", token);
}

function clearToken(){
  localStorage.removeItem("azibax_token");
}

async function apiFetch(path, options = {}) {

  const headers = options.headers || {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(API + path, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

function createBookCard(book){

  const cover = book.cover
    ? `<img src="${book.cover}" style="width:100%;height:170px;object-fit:cover;border-radius:20px;">`
    : `<div class="cover-placeholder"></div>`;

  return `
  <article class="book-card">

    ${cover}

    <div class="book-title">
      ${book.title || "Без названия"}
    </div>

    <div class="book-author">
      ${book.author || "Неизвестный автор"}
    </div>

    <div class="book-footer">

      <span class="genre-label">
        ${book.language || "Book"}
      </span>

      <a class="link-btn"
         href="${book.openlibrary_url}"
         target="_blank">

         Читать →

      </a>

    </div>

  </article>
  `;
}
