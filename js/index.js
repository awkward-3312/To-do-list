// ==== Estado ====
let currentSection = null;
let customLists = []; // Cada lista tiene: { id, name, color }

// ==== Navegación entre secciones ====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    setActiveSection(section);
  });
});

function setActiveSection(section) {
  currentSection = section;

  // Quitar clase active de todos
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Agregar clase active al botón seleccionado
  const activeBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Renderizar la vista en el panel
  renderMainPanel(section);
}

// ==== Renderizado de secciones ====
function renderMainPanel(section) {
  const panel = document.getElementById('mainPanel');
  panel.innerHTML = ''; // Limpiar

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
    events: [
      {
        title: 'Research content ideas',
        start: '2025-06-04',
        color: '#FFC8DD'
      },
      {
        title: 'Create guest DB',
        start: '2025-06-06',
        color: '#CDB4DB'
      },
      {
        title: 'Driver’s license',
        start: '2025-06-07T11:00:00',
        color: '#A2D2FF'
      },
      {
        title: 'Business lunch',
        start: '2025-06-09T13:00:00',
        color: '#FFAFCC'
      }
    ]
  });

  calendar.render();
}
  } else if (section === 'sticky') {
    panel.innerHTML = `<h2 class="text-2xl font-bold text-[#CDB4DB] mb-4">Sticky Wall</h2><p>📌 Aquí irán tus notas visuales.</p>`;
  } else {
    panel.innerHTML = `<p class="text-center text-gray-500 italic">Selecciona una sección para comenzar...</p>`;
  }
}

// ==== Abrir modal de nueva lista ====
function addList() {
  document.getElementById('addListModal').classList.remove('hidden');
}

// ==== Cerrar modal ====
function closeModal() {
  document.getElementById('addListModal').classList.add('hidden');
}

// ==== Guardar nueva lista ====
function saveList() {
  const nameInput = document.getElementById('newListName');
  const colorInput = document.getElementById('listColor');
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!name) {
    alert('Escribe un nombre para la lista.');
    return;
  }

  const id = Date.now();
  customLists.push({ id, name, color });

  nameInput.value = '';
  colorInput.value = '#BDE0FE';
  closeModal();
  renderCustomLists();
}

// ==== Renderizar las listas personalizadas en el sidebar ====
function renderCustomLists() {
  const container = document.getElementById('listContainer');
  container.innerHTML = '';

  customLists.forEach(list => {
    const btn = document.createElement('button');
    btn.className = 'flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium text-sm';
    btn.style.backgroundColor = list.color;
    btn.textContent = list.name;
    container.appendChild(btn);
  });
}

// ==== Inicializar ====
document.addEventListener('DOMContentLoaded', () => {
  renderMainPanel(null); // Vista neutra
});
