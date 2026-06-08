import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { beforeAll, describe, expect, test } from "vitest";

let app;

beforeAll(async () => {
  const testDbPath = path.join(os.tmpdir(), `library-test-${Date.now()}.db`);

  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath);
  }

  process.env.NODE_ENV = "test";
  process.env.DB_PATH = testDbPath;

  const serverModule = await import("../src/server.js");
  app = serverModule.app;
});

describe("books routes", () => {
  test("GET /api/health повертає статус ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("POST /api/books додає книгу", async () => {
    const response = await request(app)
      .post("/api/books")
      .send({
        title: "Test Book",
        author: "Test Author",
        genre: "Novel",
        year: 2024,
        rating: 5,
        status: "read",
        favorite: true
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Book");
    expect(response.body.author).toBe("Test Author");
  });

  test("GET /api/books повертає список книг", async () => {
    const response = await request(app).get("/api/books");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/books/stats повертає статистику", async () => {
    const response = await request(app).get("/api/books/stats");

    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThanOrEqual(1);
  });
});