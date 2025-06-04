// index.js
// Código actualizado con: navegación, tareas, listas, sticky notes, modo oscuro y notificaciones

// === Estado global ===
let currentSection = null;
let customLists = [];
let tasksByList = {};
let stickyNotes = [];

// === Cargar datos del almacenamiento local ===
function loadFromLocalStorage() {
  customLists = JSON.parse(localStorage.getItem('customLists')) || [];
  tasksByList = JSON.parse(localStorage.getItem('tasksByList')) || {};
  stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
}

function saveToLocalStorage() {
  localStorage.setItem('customLists', JSON.stringify(customLists));
  localStorage.setItem('tasksByList', JSON.stringify(tasksByList));
  localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
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
  setActiveSection(null);
});
