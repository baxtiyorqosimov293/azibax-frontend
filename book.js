const bookPage = document.getElementById("bookPage");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function addToFavorites(bookId) {
  try {
    await apiFetch(`/favorites/${bookId}`, { method: "POST" });
    alert("Книга добавлена в избранное");
  } catch (err) {
    alert("Нужно войти в аккаунт или проверить backend: " + err.message);
  }
}

async function loadBook() {
  if (!id) { bookPage.innerHTML = '<div class="empty-card">ID книги не найден.</div>'; return; }
  try {
    const b = await apiFetch(`/books/${id}`);
    const readLink = b.file_path ? `${API}/library/${b.file_path}` : "#";
    bookPage.innerHTML = `<article class="book-detail-card"><div class="book-big-cover"><span class="cover-genre">${genreLabel(b.genre)}</span></div><div class="book-meta"><div class="badge">${genreLabel(b.genre)}</div><h1>${escapeHtml(b.title)}</h1><div class="meta-line">Автор: ${escapeHtml(b.author)}</div><div class="meta-line">Gutenberg ID: ${escapeHtml(b.gutenberg_id || "—")}</div><div class="book-description">${escapeHtml(b.description || "Описание пока не добавлено. На следующем этапе можно подключить AI summary.")}</div><div class="action-row"><a class="primary-btn" href="${readLink}" target="_blank" rel="noopener noreferrer">Читать книгу</a><button class="secondary-btn" id="favBtn">В избранное</button><a class="ghost-btn" href="index.html">Назад</a></div><div class="notice">Для красивой читалки следующий этап — встроить EPUB reader прямо в интерфейс AziBax.</div></div></article>`;
    document.getElementById("favBtn").addEventListener("click", () => addToFavorites(b.id));
  } catch (err) {
    bookPage.innerHTML = `<div class="empty-card">${escapeHtml(err.message)}</div>`;
  }
}
loadBook();
