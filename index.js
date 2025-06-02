const input = document.getElementById("nueva-tarea");
const lista = document.getElementById("lista-tareas");

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

function renderizarTareas() {
  lista.innerHTML = "";
  tareas.forEach((tarea, index) => {
    const li = document.createElement("li");
    li.className = tarea.completada ? "completed" : "";
    li.innerHTML = `
      <span onclick="toggleCompletada(${index})">${tarea.texto}</span>
      <button class="delete" onclick="eliminarTarea(${index})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    lista.appendChild(li);
  });
}

function agregarTarea() {
  const texto = input.value.trim();
  if (texto) {
    tareas.push({ texto, completada: false });
    input.value = "";
    guardarYRenderizar();
  }
}

function toggleCompletada(index) {
  tareas[index].completada = !tareas[index].completada;
  guardarYRenderizar();
}

function eliminarTarea(index) {
  tareas.splice(index, 1);
  guardarYRenderizar();
}

function guardarYRenderizar() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
  renderizarTareas();
}

renderizarTareas();
