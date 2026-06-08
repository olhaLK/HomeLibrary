const API_URL = import.meta.env.VITE_API_URL || "";

async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Помилка запиту");
  }

  return data;
}

export function getBooks(filters = {}) {
  const params = new URLSearchParams();

  if (filters.author) {
    params.append("author", filters.author);
  }

  if (filters.genre) {
    params.append("genre", filters.genre);
  }

  const query = params.toString();

  return request(`/api/books${query ? `?${query}` : ""}`);
}

export function getFavorites() {
  return request("/api/books/favorites");
}

export function getStats() {
  return request("/api/books/stats");
}

export function createBook(book) {
  return request("/api/books", {
    method: "POST",
    body: JSON.stringify(book)
  });
}

export function updateBook(id, book) {
  return request(`/api/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book)
  });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: "DELETE"
  });
}

export function toggleFavorite(id) {
  return request(`/api/books/${id}/favorite`, {
    method: "PATCH"
  });
}