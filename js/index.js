let taskLists = []; // Arreglo para las listas
let tasks = {}; // Tareas por lista
let selectedList = null; // Lista seleccionada

// Agregar una nueva lista
const addList = () => {
    const listName = prompt("Nombre de la lista:");
    if (listName) {
        const listColor = prompt("Elige un color para la lista (en formato hexadecimal):");
        const listId = Date.now();
        taskLists.push({
            id: listId,
            name: listName,
            color: listColor || '#BDE0FE' // Color por defecto
        });
        tasks[listId] = []; // Inicializar arreglo de tareas vacías
        renderLists();
    }
};

// Renderizar listas
const renderLists = () => {
    const listContainer = document.getElementById("listContainer");
    listContainer.innerHTML = ''; // Limpiar las listas actuales

    taskLists.forEach(list => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <button onclick="selectList(${list.id})" style="background-color: ${list.color};" class="w-full py-2 mb-2 text-white rounded-lg">
                ${list.name}
            </button>
        `;
        listContainer.appendChild(listItem);
    });
};

// Seleccionar una lista y cargar las tareas
const selectList = (listId) => {
    selectedList = listId;
    renderTasks();
};

// Renderizar tareas de la lista seleccionada
const renderTasks = () => {
    const taskListContainer = document.getElementById("taskList");
    taskListContainer.innerHTML = ''; // Limpiar tareas actuales

    if (selectedList === null) {
        taskListContainer.innerHTML = '<p class="text-gray-500">Selecciona una lista para ver las tareas.</p>';
        return;
    }

    const taskList = tasks[selectedList];
    taskList.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = 'p-4 mb-4 bg-white rounded-lg shadow-lg';
        taskItem.innerHTML = `
            <span>${task.description}</span>
            <button onclick="deleteTask(${task.id})" class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 ml-4">Eliminar</button>
        `;
        taskListContainer.appendChild(taskItem);
    });
};

// Agregar tarea
const addTask = (description) => {
    if (selectedList === null) {
        alert('Selecciona una lista primero');
        return;
    }

    const newTask = {
        id: Date.now(),
        description: description
    };
    tasks[selectedList].push(newTask);
    renderTasks();
};

// Eliminar tarea
const deleteTask = (taskId) => {
    tasks[selectedList] = tasks[selectedList].filter(task => task.id !== taskId);
    renderTasks();
};

// Inicializar el calendario con FullCalendar
document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            { title: 'Tarea de prueba', start: '2023-06-01', end: '2023-06-02' }
        ]
    });
    calendar.render();
});

// Cargar la vista de listas al inicio
renderLists();
