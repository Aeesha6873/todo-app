const form = document.querySelector(".todo-form");
const todoInput = document.querySelector(".todo-input");
const list = document.querySelector("#list");
const template = document.querySelector("#list-item-template");
const footer = document.querySelector(".todo-footer");
const itemCount = footer.querySelector("p:first-child"); // "0 items left"
const filterButtons = footer.querySelectorAll(".footer-list li");
const clearCompletedBtn = footer.querySelector("p:last-child");

// Theme toggle elements
const themeToggle = document.querySelector(".todo-heading img");
const body = document.body;
const background = document.querySelector(".background");

const LOCAL_STORAGE_PREFIX = "ADVANCE_TODO_LIST";
const TODOS_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}-todos`;
const THEME_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}-theme`;

let todos = loadTodos();
todos.forEach(renderTodo);
updateItemCount();

// Load theme preference
loadTheme();

// Toggle theme when clicking the sun/moon icon
themeToggle.addEventListener("click", () => {
  const isLightMode = body.classList.toggle("light-mode");

  if (isLightMode) {
    setLightMode();
  } else {
    setDarkMode();
  }

  saveTheme();
});

function setLightMode() {
  background.style.backgroundImage = "url(../images/bg-desktop-light.jpg)";
  themeToggle.src = "../images/icon-moon.svg";
  body.style.backgroundColor = "#fff";
}

function setDarkMode() {
  background.style.backgroundImage = "url(../images/bg-desktop-dark.jpg)";
  themeToggle.src = "../images/icon-sun.svg";
  body.style.backgroundColor = "hsl(235, 21%, 11%)";
}

function saveTheme() {
  localStorage.setItem(
    THEME_STORAGE_KEY,
    body.classList.contains("light-mode") ? "light" : "dark"
  );
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    setLightMode();
  } else {
    setDarkMode();
  }
}

// Handle todo item changes
list.addEventListener("change", (e) => {
  if (!e.target.matches("[data-list-item-checkbox]")) return;

  const parent = e.target.closest(".item-list");
  const todoId = parent.dataset.todoId;
  const todo = todos.find((t) => t.id === todoId);
  if (todo) {
    todo.complete = e.target.checked;
    saveTodos();
    updateItemCount();

    // Apply or remove the strikethrough effect
    const textElement = parent.querySelector("[data-list-item-text]");
    textElement.classList.toggle("completed", todo.complete);
  }
});

// Add new todo
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const todoName = todoInput.value.trim();
  if (todoName === "") return;

  const newTodo = {
    name: todoName,
    complete: false,
    id: new Date().valueOf().toString(),
  };
  todos.push(newTodo);
  renderTodo(newTodo);
  saveTodos();
  updateItemCount();
  todoInput.value = "";
});

function renderTodo(todo) {
  const templateClone = template.content.cloneNode(true);
  const listItem = templateClone.querySelector("li");
  listItem.classList.add("item-list");
  listItem.dataset.todoId = todo.id;

  const textElement = templateClone.querySelector("[data-list-item-text]");
  textElement.innerText = todo.name;

  const checkbox = templateClone.querySelector("[data-list-item-checkbox]");
  checkbox.checked = todo.complete;

  if (todo.complete) {
    textElement.classList.add("completed");
  }

  list.appendChild(templateClone);
}

function loadTodos() {
  const todoString = localStorage.getItem(TODOS_STORAGE_KEY);
  return JSON.parse(todoString) || [];
}

function saveTodos() {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
}

// Update the items left count
function updateItemCount() {
  const remainingTodos = todos.filter((todo) => !todo.complete).length;
  itemCount.textContent = `${remainingTodos} item${
    remainingTodos !== 1 ? "s" : ""
  } left`;
}

// Filter todos based on selection
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filterType = button.innerText.toLowerCase();
    applyFilter(filterType);
  });
});

function applyFilter(filter) {
  const listItems = document.querySelectorAll(".item-list");

  listItems.forEach((item) => {
    const todoId = item.dataset.todoId;
    const todo = todos.find((t) => t.id === todoId);

    if (filter === "all") {
      item.style.display = "flex";
    } else if (filter === "active" && todo && !todo.complete) {
      item.style.display = "flex";
    } else if (filter === "completed" && todo && todo.complete) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Clear completed todos
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.complete);
  saveTodos();
  refreshTodoList();
});

// Refresh the entire list after clearing completed items
function refreshTodoList() {
  list.innerHTML = "";
  todos.forEach(renderTodo);
  updateItemCount();
}
