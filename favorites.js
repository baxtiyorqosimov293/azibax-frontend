const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesEmpty = document.getElementById("favoritesEmpty");
const favMeta = document.getElementById("favMeta");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => { clearToken(); location.href = "index.html"; });

async function removeFavorite(bookId) {
  try { await apiFetch(`/favorites/${bookId}`, { method: "DELETE" }); await loadFavorites(); }
  catch (err) { alert(err.message); }
}
function createFavoriteCard(item) {
  const b = item.book;
  return `<article class="book-card"><div class="cover-placeholder"><span class="cover-genre">${genreLabel(b.genre)}</span></div><div class="book-title">${escapeHtml(b.title)}</div><div class="book-author">${escapeHtml(b.author)}</div><div class="book-footer"><a class="link-btn" href="book.html?id=${b.id}">Открыть →</a><button class="ghost-btn" data-remove="${b.id}">Удалить</button></div></article>`;
}
async function loadFavorites() {
  if (!getToken()) {
    favMeta.textContent = "Сначала войди на главной странице.";
    favoritesGrid.innerHTML = "";
    favoritesEmpty.classList.remove("hidden");
    return;
  }
  try {
    const items = await apiFetch("/favorites");
    favMeta.textContent = `Книг в избранном: ${items.length}`;
    if (!items.length) {
      favoritesGrid.innerHTML = "";
      favoritesEmpty.classList.remove("hidden");
      return;
    }
    favoritesEmpty.classList.add("hidden");
    favoritesGrid.innerHTML = items.map(createFavoriteCard).join("");
    document.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => removeFavorite(btn.dataset.remove));
    });
  } catch (err) {
    favMeta.textContent = err.message;
    favoritesGrid.innerHTML = "";
    favoritesEmpty.classList.remove("hidden");
  }
}
loadFavorites();
