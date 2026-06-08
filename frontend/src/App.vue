<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  createBook,
  deleteBook,
  getBooks,
  getFavorites,
  getStats,
  toggleFavorite,
  updateBook
} from "./api";

const books = ref([]);
const favorites = ref([]);
const stats = ref({
  total: 0,
  read: 0,
  reading: 0,
  planned: 0,
  favorites: 0,
  averageRating: 0
});

const filters = reactive({
  author: "",
  genre: ""
});

const form = reactive({
  title: "",
  author: "",
  genre: "",
  year: "",
  rating: 3,
  status: "planned",
  favorite: false
});

const editingId = ref(null);
const errorMessage = ref("");
const isLoading = ref(false);

function resetForm() {
  form.title = "";
  form.author = "";
  form.genre = "";
  form.year = "";
  form.rating = 3;
  form.status = "planned";
  form.favorite = false;
  editingId.value = null;
}

async function loadData() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    books.value = await getBooks(filters);
    favorites.value = await getFavorites();
    stats.value = await getStats();
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}

async function submitBook() {
  errorMessage.value = "";

  const bookData = {
    title: form.title,
    author: form.author,
    genre: form.genre,
    year: form.year,
    rating: Number(form.rating),
    status: form.status,
    favorite: form.favorite
  };

  try {
    if (editingId.value) {
      await updateBook(editingId.value, bookData);
    } else {
      await createBook(bookData);
    }

    resetForm();
    await loadData();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

function startEdit(book) {
  editingId.value = book.id;
  form.title = book.title;
  form.author = book.author;
  form.genre = book.genre;
  form.year = book.year || "";
  form.rating = book.rating;
  form.status = book.status;
  form.favorite = book.favorite;
}

async function removeBook(id) {
  const isConfirmed = confirm("Видалити цю книгу?");

  if (!isConfirmed) {
    return;
  }

  try {
    await deleteBook(id);
    await loadData();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function changeFavorite(id) {
  try {
    await toggleFavorite(id);
    await loadData();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

function getStatusText(status) {
  if (status === "read") {
    return "Прочитано";
  }

  if (status === "reading") {
    return "Читаю";
  }

  return "В планах";
}

onMounted(loadData);
</script>

<template>
  <main class="page">
    <section class="hero">
      <div>
        <p class="label">Fullstack Vue + Express + SQLite</p>
        <h1>Домашня бібліотека</h1>
        <p>
          Простий застосунок для обліку книг, пошуку за автором або жанром,
          списку обраного та статистики прочитаних видань.
        </p>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Усього книг</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="stat-card">
        <span>Прочитано</span>
        <strong>{{ stats.read }}</strong>
      </article>

      <article class="stat-card">
        <span>Обране</span>
        <strong>{{ stats.favorites }}</strong>
      </article>

      <article class="stat-card">
        <span>Середній рейтинг</span>
        <strong>{{ stats.averageRating }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <form class="panel form-panel" @submit.prevent="submitBook">
        <h2>{{ editingId ? "Редагувати книгу" : "Додати книгу" }}</h2>

        <label>
          Назва
          <input v-model="form.title" type="text" placeholder="Наприклад: Лісова пісня" />
        </label>

        <label>
          Автор
          <input v-model="form.author" type="text" placeholder="Наприклад: Леся Українка" />
        </label>

        <label>
          Жанр
          <input v-model="form.genre" type="text" placeholder="Наприклад: драма" />
        </label>

        <div class="form-row">
          <label>
            Рік
            <input v-model="form.year" type="number" placeholder="1911" />
          </label>

          <label>
            Рейтинг
            <select v-model="form.rating">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="4">4</option>
              <option :value="5">5</option>
            </select>
          </label>
        </div>

        <label>
          Статус
          <select v-model="form.status">
            <option value="planned">В планах</option>
            <option value="reading">Читаю</option>
            <option value="read">Прочитано</option>
          </select>
        </label>

        <label class="checkbox">
          <input v-model="form.favorite" type="checkbox" />
          Додати до обраного
        </label>

        <div class="buttons">
          <button class="primary-button" type="submit">
            {{ editingId ? "Зберегти" : "Додати" }}
          </button>

          <button
            v-if="editingId"
            class="secondary-button"
            type="button"
            @click="resetForm"
          >
            Скасувати
          </button>
        </div>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>
      </form>

      <section class="panel">
        <h2>Пошук</h2>

        <div class="filters">
          <label>
            Автор
            <input v-model="filters.author" type="text" placeholder="Пошук за автором" />
          </label>

          <label>
            Жанр
            <input v-model="filters.genre" type="text" placeholder="Пошук за жанром" />
          </label>

          <button class="primary-button" type="button" @click="loadData">
            Знайти
          </button>

          <button
            class="secondary-button"
            type="button"
            @click="filters.author = ''; filters.genre = ''; loadData();"
          >
            Очистити
          </button>
        </div>

        <p class="hint">
          Список автоматично сортується за рейтингом: від найвищого до найнижчого.
        </p>
      </section>
    </section>

    <section class="panel">
      <div class="section-header">
        <h2>Список книг</h2>
        <span v-if="isLoading">Завантаження...</span>
      </div>

      <div v-if="books.length === 0" class="empty">
        Поки що книг немає.
      </div>

      <div v-else class="book-grid">
        <article v-for="book in books" :key="book.id" class="book-card">
          <div class="book-top">
            <h3>{{ book.title }}</h3>
            <button class="favorite-button" type="button" @click="changeFavorite(book.id)">
              {{ book.favorite ? "★" : "☆" }}
            </button>
          </div>

          <p><b>Автор:</b> {{ book.author }}</p>
          <p><b>Жанр:</b> {{ book.genre }}</p>
          <p><b>Рік:</b> {{ book.year || "Не вказано" }}</p>
          <p><b>Рейтинг:</b> {{ book.rating }}/5</p>
          <p><b>Статус:</b> {{ getStatusText(book.status) }}</p>

          <div class="card-actions">
            <button class="secondary-button" type="button" @click="startEdit(book)">
              Редагувати
            </button>

            <button class="danger-button" type="button" @click="removeBook(book.id)">
              Видалити
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>Обрана література</h2>

      <div v-if="favorites.length === 0" class="empty">
        Список обраного порожній.
      </div>

      <ul v-else class="favorite-list">
        <li v-for="book in favorites" :key="book.id">
          {{ book.title }} — {{ book.author }}
        </li>
      </ul>
    </section>
  </main>
</template>