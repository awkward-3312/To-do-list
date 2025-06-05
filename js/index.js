// index.js
// Código actualizado con: navegación, tareas, listas, sticky notes y modo oscuro

// === Estado global ===
let currentSection = null;
let customLists = [];
let tasksByList = {};
let stickyNotes = [];
let todayTasks = [];
let completedTasks = [];

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
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    setActiveSection(section);
  });
});

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
    saveToLocalStorage();
  }
}

function addTaskToList(listId, title, date) {
  if (!tasksByList[listId]) tasksByList[listId] = [];
  tasksByList[listId].push({ id: Date.now(), title, date });
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
}

function renderToday() {
  const list = document.getElementById('todayList');
  if (!list) return;
  list.innerHTML = '';
  todayTasks.sort((a, b) => a.time.localeCompare(b.time));
  todayTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white p-2 rounded shadow';
    li.innerHTML = `
      <div class="flex items-center gap-2">
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

// === Sticky Notes ===
function addStickyNote() {
  const text = prompt('Escribe tu nota:');
  if (text) {
    stickyNotes.push({ id: Date.now(), text });
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
    card.className = 'bg-yellow-100 p-4 rounded-lg shadow-md relative';
    card.innerHTML = `
      <textarea class="w-full bg-transparent resize-none text-sm text-gray-800 focus:outline-none">${note.text}</textarea>
      <button class="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700" onclick="deleteSticky(${note.id})">×</button>
    `;
    card.querySelector('textarea').addEventListener('input', e => {
      note.text = e.target.value;
      saveToLocalStorage();
    });
    wall.appendChild(card);
  });
}

function deleteSticky(id) {
  stickyNotes = stickyNotes.filter(n => n.id !== id);
  renderStickyNotes();
  saveToLocalStorage();
}

// === Modo oscuro ===
const toggle = document.getElementById('darkModeToggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});

// === Inicialización ===
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  renderCustomLists();
  renderToday();
  renderCompleted();
  setActiveSection(null);
  const addBtn = document.getElementById('addTodayTask');
  if (addBtn) addBtn.addEventListener('click', addTodayTask);
});

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
