// ui.js
// Contains rendering and modal helper functions

const { state, saveToLocalStorage } = typeof window !== 'undefined' ? window.StorageModule : require('./storage.js');

let modalType = null;
let targetListId = null;

function renderMainPanel(section) {
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

function openDataModal(type) {
  modalType = type;
  const modal = document.getElementById('dataModal');
  const inner = document.getElementById('modalInner');
  if (!modal || !inner) return;

  modal.classList.remove('hidden');
  inner.innerHTML = '';

  if (type === 'list') {
    inner.innerHTML = `
      <h3 class="text-xl font-semibold text-[#CDB4DB] mb-4"><i class="fas fa-folder-plus mr-2"></i>Nueva Lista</h3>
      <label class="block mb-2 text-sm">Nombre
        <input type="text" id="newListName" class="w-full p-2 border rounded-lg" />
      </label>
      <label class="block mb-4 text-sm">Color
        <input type="color" id="listColor" class="w-full p-2 border rounded-lg" />
      </label>
      <button id="saveModalBtn" class="button-secondary w-full p-2 rounded-lg transition-all">Guardar Lista</button>`;
  } else if (type === 'task') {
    inner.innerHTML = `
      <h3 class="text-xl font-semibold text-[#CDB4DB] mb-4"><i class="fas fa-tasks mr-2"></i>Nueva Tarea</h3>
      <label class="block mb-2 text-sm">Título
        <input type="text" id="taskTitle" class="w-full p-2 border rounded-lg" />
      </label>
      ${targetListId !== null ? '<label class="block mb-4 text-sm">Fecha<input type="date" id="taskDate" class="w-full p-2 border rounded-lg" /></label>' : '<label class="block mb-2 text-sm">Hora<input type="time" id="taskTime" class="w-full p-2 border rounded-lg" /></label><label class="block mb-4 text-sm">Prioridad<select id="taskPriority" class="w-full p-2 border rounded-lg"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></label>'}
      <button id="saveModalBtn" class="button-secondary w-full p-2 rounded-lg transition-all">Guardar Tarea</button>`;
  } else if (type === 'sticky') {
    inner.innerHTML = `
      <h3 class="text-xl font-semibold text-[#CDB4DB] mb-4"><i class="fas fa-sticky-note mr-2"></i>Nueva Nota</h3>
      <label class="block mb-4 text-sm">Texto
        <textarea id="stickyText" class="w-full p-2 border rounded-lg"></textarea>
      </label>
      <button id="saveModalBtn" class="button-secondary w-full p-2 rounded-lg transition-all">Guardar Nota</button>`;
  }

  const saveBtn = document.getElementById('saveModalBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (modalType === 'list') return saveList();
      if (modalType === 'task') return saveTask();
      if (modalType === 'sticky') return saveSticky();
    });
  }
}

function closeDataModal() {
  const modal = document.getElementById('dataModal');
  const inner = document.getElementById('modalInner');
  if (!modal || !inner) return;
  modal.classList.add('hidden');
  inner.innerHTML = '';
  modalType = null;
  targetListId = null;
}

function saveList() {
  const name = document.getElementById('newListName').value.trim();
  const color = document.getElementById('listColor').value;
  if (!name) return alert('Escribe un nombre para la lista.');
  if (state.customLists.find(l => l.name === name)) return alert('Ya existe una lista con ese nombre.');
  const id = Date.now();
  state.customLists.push({ id, name, color });
  state.tasksByList[id] = [];
  closeDataModal();
  renderCustomLists();
  saveToLocalStorage();
  animateAdd();
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) return alert('Escribe un título para la tarea.');
  if (targetListId !== null) {
    const date = document.getElementById('taskDate').value;
    if (!date) return alert('Elige una fecha para la tarea.');
    const listTasks = state.tasksByList[targetListId] || [];
    if (listTasks.find(t => t.title === title && t.date === date)) return alert('Tarea duplicada.');
    listTasks.push({ id: Date.now(), title, date });
    state.tasksByList[targetListId] = listTasks;
    renderUpcoming();
  } else {
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;
    if (state.todayTasks.find(t => t.title === title && t.time === time)) return alert('Tarea duplicada.');
    state.todayTasks.push({ id: Date.now(), title, time, priority });
    renderToday();
  }
  closeDataModal();
  saveToLocalStorage();
  animateAdd();
}

function saveSticky() {
  const text = document.getElementById('stickyText').value.trim();
  if (!text) return alert('Escribe algo en la nota.');
  state.stickyNotes.push({ id: Date.now(), text, x: 0, y: 0 });
  closeDataModal();
  renderStickyNotes();
  saveToLocalStorage();
  animateAdd();
}

function animateAdd() {
  const modal = document.getElementById('dataModal');
  if (modal) {
    modal.classList.add('animate-pulse');
    setTimeout(() => modal.classList.remove('animate-pulse'), 300);
  }
}

function renderCustomLists() {
  const container = document.getElementById('listContainer');
  container.innerHTML = '';
  state.customLists.forEach(list => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-between';
    const btn = document.createElement('button');
    btn.className = 'flex-grow px-3 py-2 rounded-lg text-white font-medium text-sm text-left hover:shadow';
    btn.style.backgroundColor = list.color;
    btn.textContent = list.name;
    btn.onclick = () => { targetListId = list.id; openDataModal('task'); };
    const del = document.createElement('button');
    del.innerHTML = '<i class="fas fa-trash" aria-label="Eliminar lista"></i>';
    del.className = 'ml-2 text-red-500 hover:text-red-700';
    del.onclick = () => deleteList(list.id);
    wrapper.appendChild(btn);
    wrapper.appendChild(del);
    container.appendChild(wrapper);
  });
}

function deleteList(id) {
  if (confirm('¿Eliminar esta lista?')) {
    state.customLists = state.customLists.filter(l => l.id !== id);
    delete state.tasksByList[id];
    renderCustomLists();
    renderUpcoming();
    saveToLocalStorage();
  }
}

function addTaskToList(listId, title, date) {
  if (!state.tasksByList[listId]) state.tasksByList[listId] = [];
  state.tasksByList[listId].push({ id: Date.now(), title, date });
  renderUpcoming();
}

function renderToday() {
  const list = document.getElementById('todayList');
  if (!list) return;
  list.innerHTML = '';
  state.todayTasks.sort((a, b) => a.time.localeCompare(b.time));
  state.todayTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white p-2 rounded shadow hover:shadow-md';
    const colors = { baja: 'green', media: 'yellow', alta: 'red' };
    li.innerHTML = `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:${colors[task.priority] || 'gray'}"></span><input aria-label="Completar" type="checkbox"><input type="text" value="${task.title}" class="task-edit border-b border-transparent focus:border-gray-400 outline-none flex-1"><span class="text-xs text-gray-500">${task.time || ''}</span></div><div class="flex items-center gap-2"><button class="delete-btn text-red-500" aria-label="Eliminar"><i class="fas fa-trash"></i></button></div>`;
    li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleComplete(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTodayTask(task.id));
    li.querySelector('.task-edit').addEventListener('change', e => editTodayTask(task.id, e.target.value));
    list.appendChild(li);
  });
}

function deleteTodayTask(id) {
  state.todayTasks = state.todayTasks.filter(t => t.id !== id);
  renderToday();
  saveToLocalStorage();
}

function editTodayTask(id, newTitle) {
  newTitle = newTitle.trim();
  if (!newTitle) return;
  const exists = state.todayTasks.some(t => t.title === newTitle && t.id !== id);
  if (exists) return alert('Tarea duplicada.');
  const task = state.todayTasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    saveToLocalStorage();
  }
}

function toggleComplete(id) {
  const task = state.todayTasks.find(t => t.id === id);
  if (!task) return;
  state.todayTasks = state.todayTasks.filter(t => t.id !== id);
  state.completedTasks.push({ ...task });
  renderToday();
  renderCompleted();
  saveToLocalStorage();
}

function renderCompleted() {
  const list = document.getElementById('completedList');
  if (!list) return;
  list.innerHTML = '';
  state.completedTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-gray-100 p-2 rounded';
    li.innerHTML = `<span>${task.title}</span><button class="restore-btn text-green-600" aria-label="Restaurar"><i class="fas fa-undo"></i></button>`;
    li.querySelector('.restore-btn').addEventListener('click', () => restoreTask(task.id));
    list.appendChild(li);
  });
}

function restoreTask(id) {
  const task = state.completedTasks.find(t => t.id === id);
  if (!task) return;
  state.completedTasks = state.completedTasks.filter(t => t.id !== id);
  state.todayTasks.push(task);
  renderCompleted();
  renderToday();
  saveToLocalStorage();
}

function gatherUpcomingTasks() {
  const tasks = [];
  const today = new Date();
  for (const list of state.customLists) {
    const taskList = state.tasksByList[list.id] || [];
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
    if (diff === 1) tomorrow.push(t); else if (diff <= 7) week.push(t); else later.push(t);
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
      item.innerHTML = `<span>${task.title} <span class="text-xs" style="color:${task.listColor}">(${task.listName})</span></span><span class="text-sm text-gray-500">${task.date}</span>`;
      section.appendChild(item);
    });
    container.appendChild(section);
  });
}

function getAllTasksAsEvents() {
  const events = [];
  for (const list of state.customLists) {
    const taskList = state.tasksByList[list.id] || [];
    for (const task of taskList) {
      events.push({ title: task.title, start: task.date, color: list.color });
    }
  }
  return events;
}

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
  for (const id in state.tasksByList) total += state.tasksByList[id].length;
  const completed = state.completedTasks.length;
  const categories = state.customLists.map(l => `${l.name}: ${state.tasksByList[l.id]?.length || 0}`);
  dash.innerHTML = `<div class="mb-2">Total tasks: <strong>${total}</strong></div><div class="mb-2">Completed: <strong>${completed}</strong></div><div class="space-y-1">${categories.map(c => `<div>${c}</div>`).join('')}</div>`;
}

function addStickyNote() {
  openDataModal('sticky');
}

function renderStickyNotes() {
  const wall = document.getElementById('stickyWall');
  if (!wall) return;
  wall.innerHTML = '';
  state.stickyNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'sticky-note rounded-lg shadow hover:shadow-md bg-yellow-100 p-2';
    card.style.left = (note.x || 0) + 'px';
    card.style.top = (note.y || 0) + 'px';
    card.innerHTML = `<textarea class="w-full bg-transparent resize-none text-sm text-gray-800 focus:outline-none">${note.text}</textarea><button class="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700" aria-label="Eliminar" onclick="EventModule.deleteSticky(${note.id})">×</button>`;
    const textarea = card.querySelector('textarea');
    textarea.addEventListener('input', e => { note.text = e.target.value; saveToLocalStorage(); });
    enableDrag(card, note);
    wall.appendChild(card);
  });
}

function enableDrag(el, note) {
  let offsetX = 0, offsetY = 0, dragging = false;
  el.addEventListener('mousedown', e => { dragging = true; offsetX = e.offsetX; offsetY = e.offsetY; });
  document.addEventListener('mousemove', e => { if (!dragging) return; note.x = e.clientX - offsetX; note.y = e.clientY - offsetY; el.style.left = note.x + 'px'; el.style.top = note.y + 'px'; });
  document.addEventListener('mouseup', () => { if (dragging) { dragging = false; saveToLocalStorage(); } });
}

if (typeof window !== 'undefined') {
  window.openDataModal = openDataModal;
  window.addStickyNote = addStickyNote;
  window.UIModule = {
    openDataModal,
    closeDataModal,
    renderMainPanel,
    renderCustomLists,
    renderToday,
    renderCompleted,
    renderUpcoming,
    renderCalendar,
    renderDashboard,
    addStickyNote,
    renderStickyNotes,
    toggleComplete,
    deleteSticky: id => EventModule.deleteSticky(id)
  };
}

// Export for tests/node
if (typeof module !== 'undefined') {
  module.exports = { openDataModal, closeDataModal, renderMainPanel, renderCustomLists, renderToday, renderCompleted, renderUpcoming, renderCalendar, renderDashboard, addStickyNote, renderStickyNotes, toggleComplete };
}
