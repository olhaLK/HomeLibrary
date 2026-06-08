function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function formatBook(book) {
  return {
    ...book,
    favorite: Boolean(book.favorite)
  };
}

export function validateBook(book) {
  const errors = [];

  if (!book.title || !book.title.trim()) {
    errors.push("Назва книги обов'язкова");
  }

  if (!book.author || !book.author.trim()) {
    errors.push("Автор обов'язковий");
  }

  if (!book.genre || !book.genre.trim()) {
    errors.push("Жанр обов'язковий");
  }

  const rating = Number(book.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("Рейтинг має бути числом від 1 до 5");
  }

  if (book.year && Number(book.year) < 0) {
    errors.push("Рік не може бути від'ємним");
  }

  return errors;
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

export function getAllBooks(database, filters = {}) {
  const books = database
    .prepare("SELECT * FROM books")
    .all()
    .map(formatBook);

  const filteredBooks = searchBooks(books, filters);

  return sortBooksByRating(filteredBooks);
}

export function getBookById(database, id) {
  const book = database.prepare("SELECT * FROM books WHERE id = ?").get(id);

  return book ? formatBook(book) : null;
}

export function createBook(database, book) {
  const errors = validateBook(book);

  if (errors.length > 0) {
    return {
      error: true,
      messages: errors
    };
  }

  const result = database
    .prepare(`
      INSERT INTO books (title, author, genre, year, rating, status, favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      book.title.trim(),
      book.author.trim(),
      book.genre.trim(),
      book.year ? Number(book.year) : null,
      Number(book.rating),
      book.status || "planned",
      book.favorite ? 1 : 0
    );

  return getBookById(database, result.lastInsertRowid);
}

export function updateBook(database, id, book) {
  const existingBook = getBookById(database, id);

  if (!existingBook) {
    return null;
  }

  const updatedBook = {
    ...existingBook,
    ...book
  };

  const errors = validateBook(updatedBook);

  if (errors.length > 0) {
    return {
      error: true,
      messages: errors
    };
  }

  database
    .prepare(`
      UPDATE books
      SET title = ?, author = ?, genre = ?, year = ?, rating = ?, status = ?, favorite = ?
      WHERE id = ?
    `)
    .run(
      updatedBook.title.trim(),
      updatedBook.author.trim(),
      updatedBook.genre.trim(),
      updatedBook.year ? Number(updatedBook.year) : null,
      Number(updatedBook.rating),
      updatedBook.status || "planned",
      updatedBook.favorite ? 1 : 0,
      id
    );

  return getBookById(database, id);
}

export function deleteBook(database, id) {
  const result = database.prepare("DELETE FROM books WHERE id = ?").run(id);

  return result.changes > 0;
}

export function toggleFavorite(database, id) {
  const book = getBookById(database, id);

  if (!book) {
    return null;
  }

  const newValue = book.favorite ? 0 : 1;

  database
    .prepare("UPDATE books SET favorite = ? WHERE id = ?")
    .run(newValue, id);

  return getBookById(database, id);
}