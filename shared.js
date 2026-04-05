const API = window.AZIBAX_API || "http://127.0.0.1:8000";

function genreLabel(genre) {
  const map = {detective:"Детектив",drama:"Драма",psychology:"Психология",self_development:"Саморазвитие"};
  return map[genre] || genre || "Книга";
}
function getToken(){return localStorage.getItem("azibax_token") || "";}
function setToken(token){localStorage.setItem("azibax_token", token);}
function clearToken(){localStorage.removeItem("azibax_token");}
function escapeHtml(text=""){return String(text).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function createBookCard(book){return `<article class="book-card"><div class="cover-placeholder"><span class="cover-genre">${genreLabel(book.genre)}</span></div><div class="book-title">${escapeHtml(book.title)}</div><div class="book-author">${escapeHtml(book.author)}</div><div class="book-footer"><span class="genre-label">${genreLabel(book.genre)}</span><a class="link-btn" href="book.html?id=${book.id}">Открыть →</a></div></article>`;}
async function apiFetch(path, options = {}) {
  const headers = {"Content-Type":"application/json", ...(options.headers || {})};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (!response.ok) {
    let detail = "Request failed";
    try { const data = await response.json(); detail = data.detail || JSON.stringify(data);} catch (_) {}
    throw new Error(detail);
  }
  const ct = response.headers.get("content-type") || "";
  return ct.includes("application/json") ? response.json() : response.text();
}
