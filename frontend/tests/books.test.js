import { describe, expect, test } from "vitest";
import {
  getReadingStats,
  searchBooks,
  sortBooksByRating
} from "../src/utils/books";

const books = [
  {
    id: 1,
    title: "Книга A",
    author: "Леся Українка",
    genre: "Драма",
    rating: 5,
    status: "read",
    favorite: true
  },
  {
    id: 2,
    title: "Книга B",
    author: "Іван Франко",
    genre: "Поезія",
    rating: 3,
    status: "planned",
    favorite: false
  },
  {
    id: 3,
    title: "Книга C",
    author: "Леся Українка",
    genre: "Поезія",
    rating: 4,
    status: "reading",
    favorite: false
  }
];

describe("books utils", () => {
  test("searchBooks шукає книги за автором", () => {
    const result = searchBooks(books, {
      author: "Леся"
    });

    expect(result).toHaveLength(2);
  });

  test("searchBooks шукає книги за жанром", () => {
    const result = searchBooks(books, {
      genre: "поезія"
    });

    expect(result).toHaveLength(2);
  });

  test("sortBooksByRating сортує книги за рейтингом", () => {
    const result = sortBooksByRating(books);

    expect(result[0].rating).toBe(5);
    expect(result[1].rating).toBe(4);
    expect(result[2].rating).toBe(3);
  });

  test("getReadingStats формує статистику прочитаних книг", () => {
    const result = getReadingStats(books);

    expect(result.total).toBe(3);
    expect(result.read).toBe(1);
    expect(result.reading).toBe(1);
    expect(result.planned).toBe(1);
    expect(result.favorites).toBe(1);
  });
});