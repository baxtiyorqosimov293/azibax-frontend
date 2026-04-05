const booksGrid = document.getElementById("booksGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogMeta = document.getElementById("catalogMeta");
const refreshBtn = document.getElementById("refreshBtn");
const heroBookCount = document.getElementById("heroBookCount");

let currentGenre = "";

async function loadBooks(genre = "") {

  try{

    catalogMeta.textContent = "Загрузка каталога...";

    let path = "/books?limit=20";

    if (genre) {
      path += `&genre=${encodeURIComponent(genre)}`;
    }

    const books = await apiFetch(path);

    renderBooks(books);

    catalogMeta.textContent = `Показано книг: ${books.length}`;

    heroBookCount.textContent = `${books.length}+`;

  }catch(err){

    catalogMeta.textContent = "Ошибка подключения к API";

    booksGrid.innerHTML = `<div class="empty-card">${err.message}</div>`;

  }

}

function renderBooks(books){

  if (!books.length){

    booksGrid.innerHTML = "";

    emptyState.classList.remove("hidden");

    return;

  }

  emptyState.classList.add("hidden");

  booksGrid.innerHTML = books.map(createBookCard).join("");

}

async function searchBooks(){

  const q = searchInput.value.trim();

  if (!q){

    await loadBooks(currentGenre);

    return;

  }

  catalogMeta.textContent = `Поиск: "${q}"`;

  const books = await apiFetch(`/books/search?q=${encodeURIComponent(q)}`);

  renderBooks(books);

}

function activateGenreButtons(){

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

searchBtn.addEventListener("click", searchBooks);

searchInput.addEventListener("keydown", (e) => {

  if (e.key === "Enter") {

    searchBooks();

  }

});

refreshBtn.addEventListener("click", () => loadBooks(currentGenre));

activateGenreButtons();

loadBooks();
