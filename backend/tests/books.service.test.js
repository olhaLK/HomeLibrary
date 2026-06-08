import { describe, expect, test } from "vitest";
import {
  getReadingStats,
  searchBooks,
  sortBooksByRating,
  validateBook
} from "../src/books.service.js";

const books = [
  {
    id: 1,
    title: "Book One",
    author: "Author A",
    genre: "Drama",
    rating: 2,
    status: "planned",
    favorite: false
  },
  {
    id: 2,
    title: "Book Two",
    author: "Author B",
    genre: "Fantasy",
    rating: 5,
    status: "read",
    favorite: true
  }
];

describe("books.service", () => {
  test("validateBook повертає помилки для порожньої книги", () => {
    const errors = validateBook({
      title: "",
      author: "",
      genre: "",
      rating: 10
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  test("searchBooks шукає за автором", () => {
    const result = searchBooks(books, {
      author: "Author B"
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Book Two");
  });

  test("sortBooksByRating сортує за спаданням рейтингу", () => {
    const result = sortBooksByRating(books);

    expect(result[0].rating).toBe(5);
  });

  test("getReadingStats рахує статистику", () => {
    const result = getReadingStats(books);

    expect(result.total).toBe(2);
    expect(result.read).toBe(1);
    expect(result.favorites).toBe(1);
  });
});