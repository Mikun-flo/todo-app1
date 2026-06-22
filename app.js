// Initial state & default data matching the design mockup
const DEFAULT_TODOS = [
  { id: 1, text: "Complete online JavaScript course", completed: true },
  { id: 2, text: "Jog around the park 3x", completed: false },
  { id: 3, text: "10 minutes meditation", completed: false },
  { id: 4, text: "Read for 1 hour", completed: false },
  { id: 5, text: "Pick up groceries", completed: false },
  { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false },
];
let todos = [];
let currentFilter = "all";

// DOM Elements
const todoList = document.getElementById("todo-list");
const newTodoInput = document.getElementById("new-todo-input");
const itemsLeftSpan = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const themeToggleBtn = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");
const filterBtns = document.querySelectorAll(".filter-btn");

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadTodos();
  setupEventListeners();
  renderTodos();
});

// Theme Logic
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  }
}
