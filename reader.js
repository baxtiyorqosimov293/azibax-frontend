const readerBookTitle = document.getElementById("readerBookTitle");
const readerBookAuthor = document.getElementById("readerBookAuthor");
const readerText = document.getElementById("readerText");
const readerStatus = document.getElementById("readerStatus");
const fontMinusBtn = document.getElementById("fontMinusBtn");
const fontPlusBtn = document.getElementById("fontPlusBtn");

let currentFontSize = Number(localStorage.getItem("azibax_reader_font") || 20);

function getReaderParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: params.get("id") || "",
    title: params.get("title") || "Без названия",
    author: params.get("author") || "Неизвестный автор",
  };
}

function applyFontSize() {
  if (!readerText) return;
  readerText.style.fontSize = `${currentFontSize}px`;
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
  const { id, title, author } = getReaderParams();

  if (!id) {
    if (readerBookTitle) readerBookTitle.textContent = "Книга не найдена";
    if (readerBookAuthor) readerBookAuthor.textContent = "AziBax Reader";
    if (readerText) readerText.textContent = "Не передан идентификатор книги.";
    if (readerStatus) readerStatus.textContent = "Ошибка";
    return;
  }

  try {
    if (readerStatus) readerStatus.textContent = "Загружаем книгу...";
    if (readerBookTitle) readerBookTitle.textContent = decodeURIComponent(title);
    if (readerBookAuthor) readerBookAuthor.textContent = decodeURIComponent(author);

    const readData = await apiFetch(`/books/read?book_id=${encodeURIComponent(decodeURIComponent(id))}`);

    if (readerText) {
      readerText.textContent =
        readData?.text || "Текст книги пока не добавлен.";
    }

    if (readerStatus) {
      readerStatus.textContent = "Книга открыта";
    }
  } catch (err) {
    console.error("Ошибка reader:", err);

    if (readerBookTitle) readerBookTitle.textContent = "Ошибка загрузки";
    if (readerBookAuthor) readerBookAuthor.textContent = "AziBax Reader";
    if (readerText) readerText.textContent = err.message || "Не удалось открыть книгу.";
    if (readerStatus) readerStatus.textContent = "Ошибка";
  }
}

applyFontSize();
loadReaderBook();
