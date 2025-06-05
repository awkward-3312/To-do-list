// index.js
// Código actualizado con: navegación, tareas, listas, sticky notes y modo oscuro

// === Estado global ===
let currentSection = null;
let customLists = [];
let tasksByList = {};
let stickyNotes = [];
let todayTasks = [];
let completedTasks = [];

// === Sidebar mobile toggle ===
function toggleSidebar(open) {
  if (typeof document === 'undefined') return;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  if (open) {
    sidebar.classList.add('open');
    overlay.classList.remove('hidden');
  } else {
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
  }
}

// === Cargar datos del almacenamiento local ===
function loadFromLocalStorage() {
  customLists = JSON.parse(localStorage.getItem('customLists')) || [];
  tasksByList = JSON.parse(localStorage.getItem('tasksByList')) || {};
  stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
  todayTasks = JSON.parse(localStorage.getItem('todayTasks')) || [];
  completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
}

function saveToLocalStorage() {
  localStorage.setItem('customLists', JSON.stringify(customLists));
  localStorage.setItem('tasksByList', JSON.stringify(tasksByList));
  localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
  localStorage.setItem('todayTasks', JSON.stringify(todayTasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// === Navegación ===
if (typeof document !== 'undefined') {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      setActiveSection(section);
    });
  });
}

function setActiveSection(section) {
  currentSection = section;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  renderMainPanel(section);
}

// === Renderizado de secciones ===
function renderMainPanel(section) {
  const panel = document.getElementById('mainPanel');
  document.querySelectorAll('#mainPanel > section').forEach(s => s.classList.add('hidden'));
  document.getElementById('defaultMessage').classList.add('hidden');

  if (document.getElementById(section)) {
    document.getElementById(section).classList.remove('hidden');
  } else {
    document.getElementById('defaultMessage').classList.remove('hidden');
  }

  if (section === 'calendar') renderCalendar();
  if (section === 'sticky') renderStickyNotes();
  if (section === 'dashboard') renderDashboard();
  if (section === 'upcoming') renderUpcoming();
}

// === Modal de Lista ===
function openModal() {
  document.getElementById('addListModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('addListModal').classList.add('hidden');
}

function saveList() {
  const nameInput = document.getElementById('newListName');
  const colorInput = document.getElementById('listColor');
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!name) return alert('Escribe un nombre para la lista.');
  if (customLists.find(l => l.name === name)) return alert('Ya existe una lista con ese nombre.');

  const id = Date.now();
  customLists.push({ id, name, color });
  tasksByList[id] = [];

  nameInput.value = '';
  colorInput.value = '#BDE0FE';
  closeModal();
  renderCustomLists();
  saveToLocalStorage();
}

// === Renderizar listas personalizadas ===
function renderCustomLists() {
  const container = document.getElementById('listContainer');
  container.innerHTML = '';

  customLists.forEach(list => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-between';

    const btn = document.createElement('button');
    btn.className = 'flex-grow px-3 py-2 rounded-lg text-white font-medium text-sm text-left';
    btn.style.backgroundColor = list.color;
    btn.textContent = list.name;
    btn.onclick = () => {
      const task = prompt(`Añadir tarea para "${list.name}"`);
      if (task) {
        const date = prompt('¿Fecha para esta tarea? (YYYY-MM-DD)');
        if (date) {
          addTaskToList(list.id, task, date);
          saveToLocalStorage();
        }
      }
    };

    const del = document.createElement('button');
    del.innerHTML = '<i class="fas fa-trash"></i>';
    del.className = 'ml-2 text-red-500 hover:text-red-700';
    del.onclick = () => deleteList(list.id);

    wrapper.appendChild(btn);
    wrapper.appendChild(del);
    container.appendChild(wrapper);
  });
}

function deleteList(id) {
  if (confirm('¿Eliminar esta lista?')) {
    customLists = customLists.filter(l => l.id !== id);
    delete tasksByList[id];
    renderCustomLists();
    renderUpcoming();
    saveToLocalStorage();
  }
}

function addTaskToList(listId, title, date) {
  if (!tasksByList[listId]) tasksByList[listId] = [];
  tasksByList[listId].push({ id: Date.now(), title, date });
  renderUpcoming();
}

// === Tareas de Hoy ===
function addTodayTask() {
  const title = prompt('Título de la tarea');
  if (!title) return;
  const time = prompt('Hora (HH:MM) opcional') || '';
  const priority = prompt('Prioridad (baja, media, alta)', 'media');
  todayTasks.push({ id: Date.now(), title, time, priority });
  renderToday();
  saveToLocalStorage();
  sendNotification('Nueva tarea: ' + title);
}

function renderToday() {
  const list = document.getElementById('todayList');
  if (!list) return;
  list.innerHTML = '';
  todayTasks.sort((a, b) => a.time.localeCompare(b.time));
  todayTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white p-2 rounded shadow';
    const colors = { baja: 'green', media: 'yellow', alta: 'red' };
    li.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" style="background:${colors[task.priority] || 'gray'}"></span>
        <input type="checkbox">
        <span>${task.title}</span>
        ${task.time ? `<span class="text-xs text-gray-500">${task.time}</span>` : ''}
      </div>
      <div class="flex items-center gap-2">
        <button class="edit-btn text-blue-500"><i class="fas fa-edit"></i></button>
        <button class="delete-btn text-red-500"><i class="fas fa-trash"></i></button>
      </div>`;
    li.querySelector('input').addEventListener('change', () => toggleComplete(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTodayTask(task.id));
    li.querySelector('.edit-btn').addEventListener('click', () => editTodayTask(task.id));
    list.appendChild(li);
  });
}

function deleteTodayTask(id) {
  todayTasks = todayTasks.filter(t => t.id !== id);
  renderToday();
  saveToLocalStorage();
}

function editTodayTask(id) {
  const task = todayTasks.find(t => t.id === id);
  if (!task) return;
  const newTitle = prompt('Editar tarea', task.title);
  if (newTitle) {
    task.title = newTitle;
    renderToday();
    saveToLocalStorage();
  }
}

function toggleComplete(id) {
  const task = todayTasks.find(t => t.id === id);
  if (!task) return;
  todayTasks = todayTasks.filter(t => t.id !== id);
  completedTasks.push({ ...task });
  renderToday();
  renderCompleted();
  saveToLocalStorage();
}

function renderCompleted() {
  const list = document.getElementById('completedList');
  if (!list) return;
  list.innerHTML = '';
  completedTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-gray-100 p-2 rounded';
    li.innerHTML = `
      <span>${task.title}</span>
      <button class="restore-btn text-green-600"><i class="fas fa-undo"></i></button>
    `;
    li.querySelector('.restore-btn').addEventListener('click', () => restoreTask(task.id));
    list.appendChild(li);
  });
}

function restoreTask(id) {
  const task = completedTasks.find(t => t.id === id);
  if (!task) return;
  completedTasks = completedTasks.filter(t => t.id !== id);
  todayTasks.push(task);
  renderCompleted();
  renderToday();
  saveToLocalStorage();
}

function gatherUpcomingTasks() {
  const tasks = [];
  const today = new Date();
  for (const list of customLists) {
    const taskList = tasksByList[list.id] || [];
    for (const task of taskList) {
      const date = new Date(task.date);
      if (date >= today) {
        tasks.push({ ...task, listName: list.name, listColor: list.color });
      }
    }
  }
  return tasks;
}

function renderUpcoming() {
  const container = document.getElementById('upcoming');
  if (!container) return;
  container.innerHTML = '';

  const tasks = gatherUpcomingTasks();
  const tomorrow = [], week = [], later = [];
  const today = new Date();
  tasks.forEach(t => {
    const diff = Math.ceil((new Date(t.date) - today) / (1000 * 60 * 60 * 24));
    if (diff === 1) tomorrow.push(t);
    else if (diff <= 7) week.push(t);
    else later.push(t);
  });

  const groups = [
    { name: 'Tomorrow', items: tomorrow },
    { name: 'This Week', items: week },
    { name: 'Later', items: later }
  ];

  groups.forEach(g => {
    if (!g.items.length) return;
    const section = document.createElement('div');
    section.className = 'mb-4';
    section.innerHTML = `<h3 class="font-semibold mb-2">${g.name}</h3>`;
    g.items.forEach(task => {
      const item = document.createElement('div');
      item.className = 'flex justify-between bg-white p-2 rounded mb-2 shadow';
      item.innerHTML = `
        <span>${task.title} <span class="text-xs" style="color:${task.listColor}">(${task.listName})</span></span>
        <span class="text-sm text-gray-500">${task.date}</span>`;
      section.appendChild(item);
    });
    container.appendChild(section);
  });
}

function getAllTasksAsEvents() {
  const events = [];
  for (const list of customLists) {
    const taskList = tasksByList[list.id] || [];
    for (const task of taskList) {
      events.push({ title: task.title, start: task.date, color: list.color });
    }
  }
  return events;
}

// === FullCalendar ===
function renderCalendar() {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: getAllTasksAsEvents()
  });
  calendar.render();
}

function renderDashboard() {
  const dash = document.getElementById('dashboard');
  if (!dash) return;
  dash.innerHTML = '';
  let total = 0;
  for (const id in tasksByList) {
    total += tasksByList[id].length;
  }
  const completed = completedTasks.length;
  const categories = customLists.map(l => `${l.name}: ${tasksByList[l.id]?.length || 0}`);
  dash.innerHTML = `
    <div class="mb-2">Total tasks: <strong>${total}</strong></div>
    <div class="mb-2">Completed: <strong>${completed}</strong></div>
    <div class="space-y-1">
      ${categories.map(c => `<div>${c}</div>`).join('')}
    </div>
  `;
}

// === Sticky Notes ===
function addStickyNote() {
  const text = prompt('Escribe tu nota:');
  if (text) {
    stickyNotes.push({ id: Date.now(), text, x: 0, y: 0 });
    renderStickyNotes();
    saveToLocalStorage();
  }
}

function renderStickyNotes() {
  const wall = document.getElementById('stickyWall');
  if (!wall) return;
  wall.innerHTML = '';

  stickyNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'sticky-note';
    card.style.left = (note.x || 0) + 'px';
    card.style.top = (note.y || 0) + 'px';
    card.innerHTML = `
      <textarea class="w-full bg-transparent resize-none text-sm text-gray-800 focus:outline-none">${note.text}</textarea>
      <button class="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700" onclick="deleteSticky(${note.id})">×</button>
    `;
    card.querySelector('textarea').addEventListener('input', e => {
      note.text = e.target.value;
      saveToLocalStorage();
    });
    enableDrag(card, note);
    wall.appendChild(card);
  });
}

function enableDrag(el, note) {
  let offsetX = 0,
      offsetY = 0,
      dragging = false;
  el.addEventListener('mousedown', e => {
    dragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    note.x = e.clientX - offsetX;
    note.y = e.clientY - offsetY;
    el.style.left = note.x + 'px';
    el.style.top = note.y + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      saveToLocalStorage();
    }
  });
}

function deleteSticky(id) {
  stickyNotes = stickyNotes.filter(n => n.id !== id);
  renderStickyNotes();
  saveToLocalStorage();
}

// === Modo oscuro ===
let toggle;
if (typeof document !== 'undefined') {
  toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark');
    });
  }
}

function sendNotification(msg) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(msg);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification(msg);
    });
  }
}

// === Inicialización ===
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderCustomLists();
    renderToday();
    renderCompleted();
    renderUpcoming();
    setActiveSection(null);
    const addBtn = document.getElementById('addTodayTask');
    if (addBtn) addBtn.addEventListener('click', addTodayTask);
    const toggleBtn = document.getElementById('toggleSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebar');
    if (toggleBtn) toggleBtn.addEventListener('click', () => toggleSidebar(true));
    if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleSidebar(false));
  });
}

// Export helpers for testing
if (typeof module !== 'undefined') {
  module.exports = {
    loadFromLocalStorage,
    saveToLocalStorage,
    // Utilities to manipulate module state in tests
    setData: (lists, tasks, notes, today, completed) => {
      customLists = lists;
      tasksByList = tasks;
      stickyNotes = notes;
      todayTasks = today;
      completedTasks = completed;
    },
    getData: () => ({ customLists, tasksByList, stickyNotes, todayTasks, completedTasks }),
    addTodayTask,
    toggleComplete,
    restoreTask
  };
}
