// === Estado global ===
let currentSection = null;
let customLists = []; // Cada lista: { id, name, color }
let tasksByList = {};  // { listId: [{ id, title, date }] }

// === Navegación entre secciones ===
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

// === Render de secciones ===
function renderMainPanel(section) {
  const panel = document.getElementById('mainPanel');
  panel.innerHTML = '';

  if (section === 'upcoming') {
    panel.innerHTML = `<h2 class="text-2xl font-bold text-[#FFAFCC] mb-4">Upcoming Tasks</h2><p>✨ Aquí verás tareas próximas.</p>`;

  } else if (section === 'today') {
    panel.innerHTML = `<h2 class="text-2xl font-bold text-[#FFC8DD] mb-4">Today's Tasks</h2><p>🗓️ Aquí irán las tareas de hoy.</p>`;

  } else if (section === 'calendar') {
    panel.innerHTML = `
      <h2 class="text-2xl font-bold text-[#A2D2FF] mb-4 flex items-center gap-2">
        <i class="fas fa-calendar-alt text-[#A2D2FF]"></i> Calendar View
      </h2>
      <div id="calendar" class="bg-white rounded-lg shadow p-4"></div>
    `;

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

  } else if (section === 'sticky') {
    panel.innerHTML = `
      <h2 class="text-2xl font-bold text-[#CDB4DB] mb-4 flex items-center gap-2">
        <i class="fas fa-sticky-note text-[#CDB4DB]"></i> Sticky Wall
      </h2>
      <div id="stickyWall" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <button onclick="addStickyNote()" class="mt-4 px-4 py-2 bg-[#FFAFCC] text-white rounded-lg">+ Nueva Nota</button>
    `;

    renderStickyNotes();

  } else {
    panel.innerHTML = `<p class="text-center text-gray-500 italic">Selecciona una sección para comenzar...</p>`;
  }
}

// === Modal para listas ===
function addList() {
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

  const id = Date.now();
  customLists.push({ id, name, color });
  tasksByList[id] = [];

  nameInput.value = '';
  colorInput.value = '#BDE0FE';
  closeModal();
  renderCustomLists();
}

function renderCustomLists() {
  const container = document.getElementById('listContainer');
  container.innerHTML = '';

  customLists.forEach(list => {
    const btn = document.createElement('button');
    btn.className = 'flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium text-sm';
    btn.style.backgroundColor = list.color;
    btn.textContent = list.name;
    btn.onclick = () => {
      const task = prompt(`Añadir tarea para la lista "${list.name}" (con fecha YYYY-MM-DD):`);
      if (task) {
        const date = prompt('¿Fecha para esta tarea? (YYYY-MM-DD)');
        if (date) addTaskToList(list.id, task, date);
      }
    };
    container.appendChild(btn);
  });
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

// === Sticky Wall ===
let stickyNotes = [];

function addStickyNote() {
  const text = prompt('Escribe tu nota:');
  if (text) {
    stickyNotes.push({ id: Date.now(), text });
    renderStickyNotes();
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
      <p class="text-sm text-gray-800">${note.text}</p>
      <button class="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700" onclick="deleteSticky(${note.id})">×</button>
    `;
    wall.appendChild(card);
  });
}

function deleteSticky(id) {
  stickyNotes = stickyNotes.filter(n => n.id !== id);
  renderStickyNotes();
}

// === Inicializar ===
document.addEventListener('DOMContentLoaded', () => {
  renderMainPanel(null);
});
