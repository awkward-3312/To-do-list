const inputTarea = document.getElementById("nueva-tarea");
const listaHoy = document.getElementById("lista-hoy");
const listaManana = document.getElementById("lista-manana");
const listaSemana = document.getElementById("lista-semana");
const selectCategoria = document.getElementById("categoria");
const selectPrioridad = document.getElementById("prioridad");
const selectSeccion = document.getElementById("seccion");
const filtroCategoria = document.getElementById("filtro-categoria");
const progresoDia = document.getElementById("progreso-dia");
const progresoTotal = document.getElementById("progreso-total");

let tareas = [];

function agregarTarea() {
  const texto = inputTarea.value.trim();
  const categoria = selectCategoria.value;
  const prioridad = selectPrioridad.value;
  const seccion = selectSeccion.value;
  const fecha = new Date().toLocaleDateString('es-ES');

  if (!texto) return;

  const nueva = {
    texto,
    completada: false,
    categoria,
    prioridad,
    seccion,
    fecha
  };

  tareas.push(nueva);
  inputTarea.value = "";
  renderizarTareas();
  renderizarCalendario();
}

function toggleCompletada(index) {
  tareas[index].completada = !tareas[index].completada;
  renderizarTareas();

  const li = document.querySelectorAll("li")[index];
  if (li) {
    li.classList.add("highlight");
    setTimeout(() => li.classList.remove("highlight"), 500);
  }
}

function eliminarTarea(index) {
  tareas.splice(index, 1);
  renderizarTareas();
  renderizarCalendario();
}

filtroCategoria.addEventListener("change", renderizarTareas);

function renderizarTareas() {
  listaHoy.innerHTML = "";
  listaManana.innerHTML = "";
  listaSemana.innerHTML = "";

  let completadasHoy = 0;
  let totalHoy = 0;
  let totalCompletadas = 0;

  tareas.forEach((tarea, index) => {
    if (filtroCategoria.value && tarea.categoria !== filtroCategoria.value) return;

    const li = document.createElement("li");
    li.setAttribute("data-categoria", tarea.categoria);
    li.setAttribute("data-prioridad", tarea.prioridad);
    if (tarea.completada) li.classList.add("completed");
    li.classList.add("fade-in");

    const span = document.createElement("span");
    span.textContent = tarea.texto;
    span.onclick = () => toggleCompletada(index);

    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("delete");
    btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnEliminar.onclick = () => eliminarTarea(index);

    li.append(span, btnEliminar);

    if (tarea.seccion === "hoy") {
      listaHoy.appendChild(li);
      totalHoy++;
      if (tarea.completada) completadasHoy++;
    } else if (tarea.seccion === "manana") {
      listaManana.appendChild(li);
    } else if (tarea.seccion === "semana") {
      listaSemana.appendChild(li);
    }

    if (tarea.completada) totalCompletadas++;
  });

  progresoDia.textContent = `✔️ Completadas hoy: ${completadasHoy} / ${totalHoy}`;
  const totalTareas = tareas.length;
  const progreso = totalTareas ? Math.round((totalCompletadas / totalTareas) * 100) : 0;
  progresoTotal.textContent = `📊 Progreso total semanal: ${progreso}%`;
}

function renderizarCalendario() {
  const contenedor = document.getElementById("calendario-grid");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const diasMes = 30; // simplificado
  for (let i = 1; i <= diasMes; i++) {
    const dia = document.createElement("div");
    dia.textContent = i;
    dia.onclick = () => mostrarTareasDelDia(i);
    contenedor.appendChild(dia);
  }
}

function mostrarTareasDelDia(diaSeleccionado) {
  const detalles = document.getElementById("detalle-dia");
  if (!detalles) return;

  const tareasDia = tareas.filter(t => {
    const fecha = new Date(t.fecha).getDate();
    return fecha === diaSeleccionado;
  });

  detalles.innerHTML = `<h3>Tareas del día ${diaSeleccionado}</h3>`;

  if (tareasDia.length === 0) {
    detalles.innerHTML += "<p>No hay tareas asignadas para este día.</p>";
    return;
  }

  const ul = document.createElement("ul");
  tareasDia.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.texto} (${t.categoria})`;
    ul.appendChild(li);
  });
  detalles.appendChild(ul);
}

function focusInput() {
  inputTarea.scrollIntoView({ behavior: "smooth" });
  inputTarea.focus();
}

renderizarTareas();
renderizarCalendario();
