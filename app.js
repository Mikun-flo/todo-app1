// Initial state & default data matching the design inspo
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

// Theme
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
function toggleTheme() {
  if (document.body.classList.contains("dark-theme")) {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
    localStorage.setItem("theme", "dark");
  }
}
// Data Sync
function loadTodos() {
  const savedTodos = localStorage.getItem("todos");
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  } else {
    todos = [...DEFAULT_TODOS];
    saveTodos();
  }
}
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
// Render UI logic
function renderTodos() {
  todoList.innerHTML = "";

  // Filtered array
  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true; // 'all'
  });
  filteredTodos.forEach((todo) => {
    const todoEl = document.createElement("div");
    todoEl.classList.add("todo-item");
    if (todo.completed) todoEl.classList.add("completed");

    // Set up drag events
    todoEl.setAttribute("draggable", "true");
    todoEl.setAttribute("data-id", todo.id);
    todoEl.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""}>
        <span class="checkbox-circle">
          ${todo.completed ? '<img src="images/icon-check.svg" alt="Check Icon" class="check-icon">' : ""}
        </span>
      </label>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" aria-label="Delete todo item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L10.414 8.05l7.264 7.263-.707.708-7.264-7.264-7.263 7.264-.708-.708 7.264-7.263L.707.707.1414 0l7.263 7.264L16.97 0z"/>
        </svg>
      </button>
    `;
    // Event listeners for checkbox toggle & delete button
    const checkbox = todoEl.querySelector(".todo-checkbox");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    const deleteBtn = todoEl.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));
    // Setup Drag & Drop listeners on each item
    setupDragDropItem(todoEl);
    todoList.appendChild(todoEl);
  });
  // Update item counts
  const activeCount = todos.filter((todo) => !todo.completed).length;
  itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? "s" : ""} left`;
}
// Event Listeners Setup
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener("click", toggleTheme);
  // New Todo Input
  newTodoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const text = newTodoInput.value.trim();
      if (text) {
        addTodo(text);
        newTodoInput.value = "";
      }
    }
  });
  // Filters (Desktop + Mobile)
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedFilter = e.target.getAttribute("data-filter");

      // Update filter state
      currentFilter = selectedFilter;
      // Update UI active state across both mobile and desktop buttons
      filterBtns.forEach((b) => {
        if (b.getAttribute("data-filter") === selectedFilter) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      renderTodos();
    });
  });

  // Clear Completed
  clearCompletedBtn.addEventListener("click", clearCompleted);

  // Drag and Drop dragover container logic
  todoList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingEl = document.querySelector(".dragging");
    if (!draggingEl) return;

    const afterElement = getDragAfterElement(todoList, e.clientY);
    if (afterElement == null) {
      todoList.appendChild(draggingEl);
    } else {
      todoList.insertBefore(draggingEl, afterElement);
    }
  });
  todoList.addEventListener("drop", (e) => {
    e.preventDefault();
    saveNewOrder();
  });
}

// Drag & Drop Item Listeners
function setupDragDropItem(item) {
  item.addEventListener("dragstart", () => {
    // Timeout keeps the captured drag ghost image opaque
    setTimeout(() => {
      item.classList.add("dragging");
    }, 0);
  });
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    saveNewOrder();
  });
}
// Find placement node
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".todo-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}
// Read current DOM positions and update todos array order
function saveNewOrder() {
  const renderedItems = [...todoList.querySelectorAll(".todo-item")];
  const reorderedIds = renderedItems.map((item) =>
    parseInt(item.getAttribute("data-id")),
  );

  const newTodos = [];

  const sortedVisibleTodos = reorderedIds
    .map((id) => todos.find((todo) => todo.id === id))
    .filter(Boolean);

  if (currentFilter === "all") {
    todos = sortedVisibleTodos;
  } else {
    let visibleIndex = 0;
    todos = todos.map((todo) => {
      const isVisible = reorderedIds.includes(todo.id);
      if (isVisible) {
        return sortedVisibleTodos[visibleIndex++];
      }
      return todo;
    });
  }
  saveTodos();
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
  };
  todos.push(newTodo);
  saveTodos();
  renderTodos();
}
// Delete actions
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}
// Toggle actions
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}
// Clear actions
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}
// Utility for HTML escaping
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
