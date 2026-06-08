function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function searchBooks(books, filters = {}) {
  const author = normalizeText(filters.author);
  const genre = normalizeText(filters.genre);

  return books.filter((book) => {
    const matchesAuthor = !author || normalizeText(book.author).includes(author);
    const matchesGenre = !genre || normalizeText(book.genre).includes(genre);

    return matchesAuthor && matchesGenre;
  });
}

export function sortBooksByRating(books) {
  return [...books].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }

    return a.title.localeCompare(b.title);
  });
}

export function getReadingStats(books) {
  const total = books.length;
  const read = books.filter((book) => book.status === "read").length;
  const reading = books.filter((book) => book.status === "reading").length;
  const planned = books.filter((book) => book.status === "planned").length;
  const favorites = books.filter((book) => book.favorite).length;

  const averageRating =
    total === 0
      ? 0
      : Number(
          (
            books.reduce((sum, book) => sum + Number(book.rating), 0) / total
          ).toFixed(2)
        );

  return {
    total,
    read,
    reading,
    planned,
    favorites,
    averageRating
  };
}