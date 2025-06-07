// storage.js
// Handles data persistence using localStorage

const state = {
  customLists: [],
  tasksByList: {},
  stickyNotes: [],
  todayTasks: [],
  completedTasks: []
};

function loadFromLocalStorage() {
  state.customLists = JSON.parse(localStorage.getItem('customLists')) || [];
  state.tasksByList = JSON.parse(localStorage.getItem('tasksByList')) || {};
  state.stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
  state.todayTasks = JSON.parse(localStorage.getItem('todayTasks')) || [];
  state.completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
}

function saveToLocalStorage() {
  localStorage.setItem('customLists', JSON.stringify(state.customLists));
  localStorage.setItem('tasksByList', JSON.stringify(state.tasksByList));
  localStorage.setItem('stickyNotes', JSON.stringify(state.stickyNotes));
  localStorage.setItem('todayTasks', JSON.stringify(state.todayTasks));
  localStorage.setItem('completedTasks', JSON.stringify(state.completedTasks));
}

function setData(lists, tasks, notes, today, completed) {
  state.customLists = lists;
  state.tasksByList = tasks;
  state.stickyNotes = notes;
  state.todayTasks = today;
  state.completedTasks = completed;
}

function getData() {
  return {
    customLists: state.customLists,
    tasksByList: state.tasksByList,
    stickyNotes: state.stickyNotes,
    todayTasks: state.todayTasks,
    completedTasks: state.completedTasks
  };
}

// expose in browser
if (typeof window !== 'undefined') {
  window.StorageModule = { state, loadFromLocalStorage, saveToLocalStorage };
}

// export for tests/node
if (typeof module !== 'undefined') {
  module.exports = {
    state,
    loadFromLocalStorage,
    saveToLocalStorage,
    setData,
    getData
  };
}
