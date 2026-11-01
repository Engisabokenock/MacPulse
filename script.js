// =====================================
// MacPulse - Productivity Dashboard
// =====================================

// DOM Elements
const clock = document.getElementById("clock");
const dateElement = document.getElementById("date");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const sessionCount = document.getElementById("sessionCount");

const timerDisplay = document.getElementById("timerDisplay");
const timerMode = document.getElementById("timerMode");
const startTimer = document.getElementById("startTimer");
const resetTimer = document.getElementById("resetTimer");
const themeToggle = document.getElementById("themeToggle");

// Application State
let tasks = JSON.parse(localStorage.getItem("macpulseTasks")) || [];
let sessions = Number(localStorage.getItem("macpulseSessions")) || 0;

let currentMinutes = 25;
let remainingSeconds = currentMinutes * 60;
let timerInterval = null;
let isRunning = false;
let currentMode = "focus";
let currentFilter = "all";

// =====================================
// 1. LIVE CLOCK
// =====================================

function updateClock() {
  const now = new Date();

  clock.textContent = now.toLocaleTimeString("en-US", {
    hour12: false
  });

  dateElement.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

updateClock();
setInterval(updateClock, 1000);

// =====================================
// 2. TASK MANAGEMENT
// =====================================

function saveTasks() {
  localStorage.setItem("macpulseTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  emptyMessage.style.display =
    filteredTasks.length === 0 ? "block" : "none";

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Complete task");

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    left.append(checkbox, text);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.append(left, deleteButton);
    taskList.appendChild(li);
  });

  updateStatistics();
}

function updateStatistics() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  sessionCount.textContent = sessions;
}

// Add new task
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    completed: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
});

// Task filters
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")
      ?.classList.remove("active");

    button.classList.add("active");

    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

// Initial task rendering
renderTasks();

// =====================================
// 3. POMODORO TIMER
// =====================================

function updateTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  startTimer.textContent = "▶ Start";
}

function startCountdown() {
  if (isRunning) return;

  if (remainingSeconds <= 0) {
    remainingSeconds = currentMinutes * 60;
    updateTimerDisplay();
  }

  isRunning = true;
  startTimer.textContent = "Ⅱ Pause";

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();

      if (currentMode === "focus") {
        sessions++;
        localStorage.setItem("macpulseSessions", sessions);
        updateStatistics();
      }

      const message = currentMode === "focus"
        ? "Focus session completed! Great work."
        : "Break completed! Ready to focus again?";

      alert(message);
    }
  }, 1000);
}

function resetCountdown() {
  stopTimer();
  remainingSeconds = currentMinutes * 60;
  updateTimerDisplay();
}

// Start / Pause
startTimer.addEventListener("click", () => {
  if (isRunning) {
    stopTimer();
  } else {
    startCountdown();
  }
});

// Reset
resetTimer.addEventListener("click", resetCountdown);

// Timer modes
document.querySelectorAll(".mode-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".mode-btn.active")
      ?.classList.remove("active");

    button.classList.add("active");

    currentMinutes = Number(button.dataset.minutes);
    currentMode = button.dataset.mode;

    timerMode.textContent =
      currentMode === "focus"
        ? "FOCUS SESSION"
        : currentMode === "short"
          ? "SHORT BREAK"
          : "LONG BREAK";

    resetCountdown();
  });
});

updateTimerDisplay();

// =====================================
// 4. DARK / LIGHT MODE
// =====================================

const savedTheme = localStorage.getItem("macpulseTheme");

if (savedTheme === "light") {
  document.body.classList.add("light");
}

function updateThemeButton() {
  const isLight = document.body.classList.contains("light");

  themeToggle.textContent = isLight
    ? "🌙 Dark mode"
    : "☀️ Light mode";
}

updateThemeButton();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const theme = document.body.classList.contains("light")
    ? "light"
    : "dark";

  localStorage.setItem("macpulseTheme", theme);

  updateThemeButton();
});

// =====================================
// 5. INITIALIZATION
// =====================================

console.log("MacPulse initialized successfully!");
console.log("Tasks loaded:", tasks.length);
console.log("Focus sessions:", sessions);