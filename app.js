// --- 画面要素の取得 ---
const currentDateInput = document.getElementById('current-date');
const scheduleForm = document.getElementById('schedule-form');
const taskHourSelect = document.getElementById('task-hour');
const taskMinuteSelect = document.getElementById('task-minute');
const taskTitleInput = document.getElementById('task-title');
const scheduleList = document.getElementById('schedule-list');
const listTitle = document.getElementById('list-title');

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. 時と分のプルダウン選択肢を動的に生成
  populateTimeOptions();

  // 2. ローカルの正確な「本日の日付（YYYY-MM-DD）」を取得してカレンダーにセット
  const today = getTodayDateString();
  currentDateInput.value = today;

  // 3. 本日のタスクを読み込み
  refreshUI();
});

// カレンダーの日付が変更されたときにタスク一覧を切り替え
currentDateInput.addEventListener('change', refreshUI);

// --- ローカルの今日の日付を「YYYY-MM-DD」形式で取得する関数（時差対策） ---
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  // 月は0から始まるため +1 し、2桁（例: 08）に揃える
  const month = String(now.getMonth() + 1).padStart(2, '0');
  // 日を2桁（例: 15）に揃える
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// --- 時間選択（時・分）の選択肢を作成する関数 ---
function populateTimeOptions() {
  // 「時」の選択肢生成（00〜23）
  for (let h = 0; h < 24; h++) {
    const hourStr = String(h).padStart(2, '0');
    const option = document.createElement('option');
    option.value = hourStr;
    option.textContent = hourStr;
    taskHourSelect.appendChild(option);
  }

  // 「分」の選択肢生成（15分刻み: 00, 15, 30, 45）
  const minutes = ['00', '15', '30', '45'];
  minutes.forEach(m => {
    const option = document.createElement('option');
    option.value = m;
    option.textContent = m;
    taskMinuteSelect.appendChild(option);
  });

  // 初期値として「09:00」をセット
  taskHourSelect.value = '09';
  taskMinuteSelect.value = '00';
}

// --- フォーム送信処理（タスク追加） ---
scheduleForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const selectedDate = currentDateInput.value;
  const taskTime = `${taskHourSelect.value}:${taskMinuteSelect.value}`;
  const taskTitle = taskTitleInput.value;

  const newTask = {
    id: Date.now(),
    date: selectedDate,
    time: taskTime,
    title: taskTitle,
    completed: false
  };

  saveTask(newTask);
  refreshUI();

  // タイトル入力のみクリア
  taskTitleInput.value = '';
});

// --- ストレージ操作（データ保存・取得） ---
function getTasksFromStorage() {
  return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}

function saveTask(task) {
  const tasks = getTasksFromStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- 画面描画処理 ---
function refreshUI() {
  const selectedDate = currentDateInput.value;
  listTitle.textContent = `${selectedDate} の予定`;
  scheduleList.innerHTML = '';

  const tasks = getTasksFromStorage();
  const filteredTasks = tasks.filter(task => task.date === selectedDate);
  filteredTasks.sort((a, b) => a.time.localeCompare(b.time));

  filteredTasks.forEach(task => renderTask(task));
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  li.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
    <span class="task-time">${task.time}</span>
    <span class="task-title">${escapeHTML(task.title)}</span>
    <button class="delete-btn" onclick="deleteTask(${task.id})">削除</button>
  `;

  scheduleList.appendChild(li);
}

// --- 完了フラグの切り替え処理 ---
function toggleTaskComplete(id) {
  let tasks = getTasksFromStorage();
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  refreshUI();
}

// --- タスク削除処理 ---
function deleteTask(id) {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  refreshUI();
}

// セキュリティ対策（文字のエスケープ処理）
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
