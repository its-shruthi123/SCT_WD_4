
const addForm = document.getElementById("addForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const streakCount = document.getElementById("streakCount");
const completedCount = document.getElementById("completedCount");
const badgeLabel = document.getElementById("badgeLabel");
const progressFill = document.getElementById("progressFill");

const showAll = document.getElementById("showAll");
const showActive = document.getElementById("showActive");
const showCompleted = document.getElementById("showCompleted");
const sortSelect = document.getElementById("sortSelect");

const quickAddBtns = document.querySelectorAll(".quick-add button");
const themeToggle = document.getElementById("themeToggle");
const toastHost = document.getElementById("toastHost");


const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDate = document.getElementById("editDate");
const editTime = document.getElementById("editTime");
const cancelEdit = document.getElementById("cancelEdit");

let editingTask = null;


let tasks = [];
let filter = "all";
let streak = 0;
let completed = 0;


function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastHost.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade");
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function updateStats() {
  completed = tasks.filter(t => t.completed).length;
  completedCount.textContent = completed;

  
  streak = completed;
  streakCount.textContent = streak;

  if (completed >= 10) badgeLabel.textContent = "Gold";
  else if (completed >= 5) badgeLabel.textContent = "Silver";
  else if (completed >= 1) badgeLabel.textContent = "Bronze";
  else badgeLabel.textContent = "—";

  
  const percent = tasks.length ? (completed / tasks.length) * 100 : 0;
  progressFill.style.width = percent + "%";
}

function renderTasks() {
  taskList.innerHTML = "";

  let filtered = tasks;
  if (filter === "active") filtered = tasks.filter(t => !t.completed);
  if (filter === "completed") filtered = tasks.filter(t => t.completed);

 
  const sort = sortSelect.value;
  filtered = [...filtered].sort((a, b) => {
    if (sort === "created_desc") return b.created - a.created;
    if (sort === "created_asc") return a.created - b.created;
    if (sort === "due_asc") return (a.due || Infinity) - (b.due || Infinity);
    if (sort === "due_desc") return (b.due || 0) - (a.due || 0);
    return 0;
  });

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="task-title ${task.completed ? "done" : ""}">
        ${task.title}
        ${task.due ? `<small>(${new Date(task.due).toLocaleString()})</small>` : ""}
      </span>
      <div class="task-actions">
        <button class="chip toggle">${task.completed ? "Undo" : "Done"}</button>
        <button class="chip edit">✏️</button>
        <button class="chip delete">✖</button>
      </div>
    `;

    
    li.querySelector(".toggle").addEventListener("click", () => {
      task.completed = !task.completed;
      showToast(task.completed ? "Task completed 🎉" : "Task marked active");
      updateStats();
      renderTasks();
    });

    
    li.querySelector(".delete").addEventListener("click", () => {
      tasks.splice(tasks.indexOf(task), 1);
      showToast("Task deleted 🗑");
      updateStats();
      renderTasks();
    });

    
    li.querySelector(".edit").addEventListener("click", () => {
      editingTask = task;
      editTitle.value = task.title;
      if (task.due) {
        const d = new Date(task.due);
        editDate.value = d.toISOString().split("T")[0];
        editTime.value = d.toTimeString().slice(0,5);
      } else {
        editDate.value = "";
        editTime.value = "";
      }
      editModal.classList.remove("hidden");
    });

    taskList.appendChild(li);
  });

  emptyState.style.display = filtered.length ? "none" : "block";
}


addForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = taskTitle.value.trim();
  if (!title) return;

  const dueDate = taskDate.value;
  const dueTime = taskTime.value;
  let due = null;
  if (dueDate) {
    due = new Date(dueDate + (dueTime ? "T" + dueTime : "T00:00")).getTime();
  }

  tasks.push({
    title,
    completed: false,
    created: Date.now(),
    due
  });

  taskTitle.value = "";
  taskDate.value = "";
  taskTime.value = "";

  showToast("Task added ✅");
  updateStats();
  renderTasks();
});

[showAll, showActive, showCompleted].forEach(btn => {
  btn.addEventListener("click", () => {
    [showAll, showActive, showCompleted].forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.id.replace("show", "").toLowerCase();
    renderTasks();
  });
});

sortSelect.addEventListener("change", renderTasks);

quickAddBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const today = new Date();
    if (btn.dataset.quick === "tomorrow") today.setDate(today.getDate() + 1);

    taskDate.value = today.toISOString().split("T")[0];
    taskTime.value = "09:00";
    showToast(`Quick set for ${btn.dataset.quick}`);
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});


editForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!editingTask) return;

  editingTask.title = editTitle.value.trim() || editingTask.title;

  if (editDate.value) {
    editingTask.due = new Date(editDate.value + (editTime.value ? "T" + editTime.value : "T00:00")).getTime();
  } else {
    editingTask.due = null;
  }

  showToast("Task updated ✏️");
  editModal.classList.add("hidden");
  editingTask = null;
  renderTasks();
});

cancelEdit.addEventListener("click", () => {
  editModal.classList.add("hidden");
  editingTask = null;
});


renderTasks();
updateStats();