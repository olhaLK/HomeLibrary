import "dotenv/config";
import express from "express";
import cors from "cors";

import { db, initDb } from "./db.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  getReadingStats,
  toggleFavorite,
  updateBook
} from "./books.service.js";

initDb();

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Home Library API працює"
  });
});

app.get("/api/books", (req, res) => {
  const books = getAllBooks(db, {
    author: req.query.author,
    genre: req.query.genre
  });

  res.json(books);
});

app.get("/api/books/favorites", (req, res) => {
  const books = getAllBooks(db).filter((book) => book.favorite);

  res.json(books);
});

app.get("/api/books/stats", (req, res) => {
  const books = getAllBooks(db);

  res.json(getReadingStats(books));
});

app.get("/api/books/:id", (req, res) => {
  const book = getBookById(db, Number(req.params.id));

  if (!book) {
    return res.status(404).json({
      message: "Книгу не знайдено"
    });
  }

  res.json(book);
});

app.post("/api/books", (req, res) => {
  const result = createBook(db, req.body);

  if (result.error) {
    return res.status(400).json({
      message: "Помилка валідації",
      errors: result.messages
    });
  }

  res.status(201).json(result);
});

app.put("/api/books/:id", (req, res) => {
  const result = updateBook(db, Number(req.params.id), req.body);

  if (!result) {
    return res.status(404).json({
      message: "Книгу не знайдено"
    });
  }

  if (result.error) {
    return res.status(400).json({
      message: "Помилка валідації",
      errors: result.messages
    });
  }

  res.json(result);
});

app.patch("/api/books/:id/favorite", (req, res) => {
  const result = toggleFavorite(db, Number(req.params.id));

  if (!result) {
    return res.status(404).json({
      message: "Книгу не знайдено"
    });
  }

  res.json(result);
});

app.delete("/api/books/:id", (req, res) => {
  const deleted = deleteBook(db, Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({
      message: "Книгу не знайдено"
    });
  }

  res.json({
    message: "Книгу видалено"
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend запущено на http://localhost:${PORT}`);
  });
}