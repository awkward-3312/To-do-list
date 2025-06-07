// events.js
// Wire up UI interactions

const { state, loadFromLocalStorage, saveToLocalStorage } = typeof window !== 'undefined' ? window.StorageModule : require('./storage.js');
const UI = typeof window !== 'undefined' ? window.UIModule : require('./ui.js');

function toggleSidebar(open) {
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

function setActiveSection(section) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  UI.renderMainPanel ? UI.renderMainPanel(section) : null;
}

function deleteSticky(id) {
  state.stickyNotes = state.stickyNotes.filter(n => n.id !== id);
  UI.renderStickyNotes();
  saveToLocalStorage();
}

function initEvents() {
  loadFromLocalStorage();
  if (UI.renderCustomLists) UI.renderCustomLists();
  if (UI.renderToday) UI.renderToday();
  if (UI.renderCompleted) UI.renderCompleted();
  if (UI.renderUpcoming) UI.renderUpcoming();
  setActiveSection(null);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveSection(btn.dataset.section));
  });

  const addBtn = document.getElementById('addTodayTask');
  if (addBtn) addBtn.addEventListener('click', () => { UI.openDataModal('task'); });

  const toggleBtn = document.getElementById('toggleSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('closeSidebar');
  if (toggleBtn) toggleBtn.addEventListener('click', () => toggleSidebar(true));
  if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleSidebar(false));

  document.getElementById('stickyWall')?.addEventListener('dblclick', UI.addStickyNote);
}

if (typeof window !== 'undefined') {
  window.EventModule = { initEvents, deleteSticky };
  document.addEventListener('DOMContentLoaded', initEvents);
}

if (typeof module !== 'undefined') {
  module.exports = { initEvents, deleteSticky };
}
