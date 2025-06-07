const { loadFromLocalStorage, saveToLocalStorage, setData, getData } = require('../js/storage.js');

describe('localStorage helpers', () => {
  beforeEach(() => {
    global.localStorage = {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, value) { this.store[key] = value; },
      clear() { this.store = {}; }
    };
  });

  test('data round trips correctly', () => {
    const lists = [{ id: 1, name: 'Test', color: '#fff' }];
    const tasks = { 1: [{ id: 1, title: 'Task', date: '2023-01-01' }] };
    const notes = [{ id: 1, text: 'Note' }];
    const today = [{ id: 1, title: 'Today Task', time: '', priority: 'alta' }];
    const completed = [{ id: 2, title: 'Done', time: '', priority: 'media' }];

    setData(lists, tasks, notes, today, completed);
    saveToLocalStorage();

    setData([], {}, [], [], []);
    loadFromLocalStorage();

    const data = getData();
    expect(data.customLists).toEqual(lists);
    expect(data.tasksByList).toEqual(tasks);
    expect(data.stickyNotes).toEqual(notes);
    expect(data.todayTasks).toEqual(today);
    expect(data.completedTasks).toEqual(completed);
  });
});
