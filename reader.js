const readerBookTitle = document.getElementById("readerBookTitle");
const readerBookAuthor = document.getElementById("readerBookAuthor");
const readerText = document.getElementById("readerText");
const readerStatus = document.getElementById("readerStatus");
const fontMinusBtn = document.getElementById("fontMinusBtn");
const fontPlusBtn = document.getElementById("fontPlusBtn");

let currentFontSize = Number(localStorage.getItem("azibax_reader_font") || 20);

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function applyFontSize() {
  if (readerText) {
    readerText.style.fontSize = `${currentFontSize}px`;
  }
  localStorage.setItem("azibax_reader_font", String(currentFontSize));
}

fontMinusBtn?.addEventListener("click", () => {
  currentFontSize = Math.max(16, currentFontSize - 1);
  applyFontSize();
});

fontPlusBtn?.addEventListener("click", () => {
  currentFontSize = Math.min(30, currentFontSize + 1);
  applyFontSize();
});

async function loadReaderBook() {
  const bookId = getBookIdFromUrl();

  if (!bookId) {
    readerBookTitle.textContent = "Книга не найдена";
    readerText.textContent = "Не передан идентификатор книги.";
    readerStatus.textContent = "Ошибка";
    return;
  }

  try {
    readerStatus.textContent = "Загружаем книгу...";

    const book = await apiFetch(`/books/${bookId}`);
    const readData = await apiFetch(`/books/${bookId}/read`);

    readerBookTitle.textContent = book.title || "Без названия";
    readerBookAuthor.textContent = book.author || "Неизвестный автор";
    readerText.textContent = readData.text || "Текст книги пока не добавлен.";
    readerStatus.textContent = "Книга открыта";
  } catch (err) {
    console.error(err);
    readerBookTitle.textContent = "Ошибка загрузки";
    readerText.textContent = err.message || "Не удалось открыть книгу.";
    readerStatus.textContent = "Ошибка";
  }
}

applyFontSize();
loadReaderBook();
