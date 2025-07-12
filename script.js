let filter = 'all';

function addTask(taskText = null, completed = false, dueDate = null) {
  const input = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const text = taskText || input.value.trim();
  const date = dueDate || dateInput.value;
  if (text === '') return;

  const li = document.createElement('li');
  if (completed) li.classList.add('completed');

  const taskSpan = document.createElement('span');
  taskSpan.innerText = text;

  // Edit task on double click
  taskSpan.ondblclick = () => {
    const newText = prompt('Edit Task:', taskSpan.innerText);
    if (newText !== null && newText.trim() !== '') {
      taskSpan.innerText = newText.trim();
      saveTasks();
    }
  };

  taskSpan.onclick = () => {
    li.classList.toggle('completed');
    saveTasks();
    applyFilter();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
  };

  const dateSpan = document.createElement('span');
  dateSpan.className = 'task-date';
  if (date) {
    const dateObj = new Date(date);
    dateSpan.innerText = '🕓 ' + dateObj.toLocaleDateString();
    if (new Date().setHours(0, 0, 0, 0) > dateObj.setHours(0, 0, 0, 0)) {
      li.classList.add('overdue');
    }
  }

  li.appendChild(taskSpan);
  if (date) li.appendChild(dateSpan);
  li.appendChild(deleteBtn);
  document.getElementById('taskList').appendChild(li);

  if (!taskText) {
    input.value = '';
    dateInput.value = '';
  }
  saveTasks();
  applyFilter();
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    const text = li.querySelector('span').innerText;
    const completed = li.classList.contains('completed');
    const dateSpan = li.querySelector('.task-date');
    const date = dateSpan ? dateSpan.innerText.replace('🕓 ', '') : null;
    tasks.push({ text, completed, dueDate: date });
  });
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('todoTasks');
  if (!saved) return;
  const tasks = JSON.parse(saved);
  tasks.forEach(task => addTask(task.text, task.completed, task.dueDate));
}

function setFilter(value) {
  filter = value;
  applyFilter();
}

function applyFilter() {
  const items = document.querySelectorAll('#taskList li');
  items.forEach(li => {
    const isCompleted = li.classList.contains('completed');
    if (
      filter === 'all' ||
      (filter === 'active' && !isCompleted) ||
      (filter === 'completed' && isCompleted)
    ) {
      li.style.display = 'flex';
    } else {
      li.style.display = 'none';
    }
  });
}

function clearAllTasks() {
  if (confirm("Clear all tasks?")) {
    document.getElementById('taskList').innerHTML = '';
    saveTasks();
  }
}

// Theme toggle
const toggle = document.getElementById('themeToggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

function loadTheme() {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === 'true') {
    document.body.classList.add('dark-mode');
    toggle.checked = true;
  }
}

// Notification setup
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function notifyDueTasks() {
  if ("Notification" in window && Notification.permission === "granted") {
    const now = new Date().setHours(0, 0, 0, 0);
    document.querySelectorAll('#taskList li').forEach(li => {
      if (!li.classList.contains('completed') && li.classList.contains('overdue')) {
        const taskText = li.querySelector('span').innerText;
        new Notification("⏰ Task Overdue", {
          body: taskText
        });
      }
    });
  }
}

// Init
window.onload = () => {
  loadTasks();
  loadTheme();
  applyFilter();
  requestNotificationPermission();
  setTimeout(notifyDueTasks, 1000);
};
