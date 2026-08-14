let appData = JSON.parse(localStorage.getItem('diet_planner_data_v2')) || {
    nickname: "플레이어",
    startWeight: 65.0,
    currentWeight: 65.0,
    targetWeight: 50.0,
    strength: 10,
    endurance: 10,
    stress: 20,
    todos: {} 
};

let selectedDateKey = "";

window.onload = function() {
    let today = new Date();
    selectedDateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    updateAllUI();
    renderCalendar(today.getFullYear(), today.getMonth() + 1);
};

function saveData() {
    localStorage.setItem('diet_planner_data_v2', JSON.stringify(appData));
}

function switchTab(tabName, btnElem) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).style.display = 'block';
    btnElem.classList.add('active');
    if(tabName === 'home') updateAllUI();
}

function renderCalendar(year, month) {
    let grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    document.getElementById('calendarTitle').innerText = `${year}년 ${month}월`;

    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    daysOfWeek.forEach(d => {
        let h = document.createElement('div');
        h.className = 'cal-day-header';
        h.innerText = d;
        grid.appendChild(h);
    });

    let lastDay = new Date(year, month, 0).getDate();
    let firstDayIndex = new Date(year, month - 1, 1).getDay();

    for (let i = 0; i < firstDayIndex; i++) {
        let emptyCell = document.createElement('div');
        grid.appendChild(emptyCell);
    }

    let today = new Date();
    let currentY = today.getFullYear();
    let currentM = today.getMonth() + 1;
    let currentD = today.getDate();

    for (let i = 1; i <= lastDay; i++) {
        let cell = document.createElement('div');
        cell.className = 'cal-cell';
        let dateKey = `${year}-${month}-${i}`;

        if (i === currentD && month === currentM && year === currentY) {
            cell.classList.add('today');
        }
        if (dateKey === selectedDateKey) {
            cell.classList.add('selected');
        }

        cell.innerHTML = `<span>${i}</span>`;

        if (appData.todos[dateKey] && appData.todos[dateKey].length > 0) {
            let dot = document.createElement('div');
            dot.className = 'has-todo-dot';
            cell.appendChild(dot);
        }

        cell.onclick = function() {
            selectedDateKey = dateKey;
            renderCalendar(year, month);
            updateSelectedDateView();
        };

        grid.appendChild(cell);
    }
    updateSelectedDateView();
}

function updateSelectedDateView() {
    let parts = selectedDateKey.split('-');
    document.getElementById('selectedDateTitle').innerText = `${parts[1]}월 ${parts[2]}일 일정 관리`;
    
    let listUl = document.getElementById('selectedDateTodoList');
    listUl.innerHTML = '';

    let dayTodos = appData.todos[selectedDateKey] || [];
    if (dayTodos.length === 0) {
        listUl.innerHTML = `<li style="text-align:center; color:#888; font-size:0.8em; border:none; background:none;">등록된 일정이 없습니다.</li>`;
        return;
    }

    dayTodos.forEach((todo, idx) => {
        let li = document.createElement('li');
        if (todo.done) li.className = 'completed';
        li.innerHTML = `
            <span style="${todo.done ? 'text-decoration:line-through; color:#aaa;' : ''}">${todo.text}</span>
            <div>
                <button onclick="toggleTodo('${selectedDateKey}', ${idx})" style="background:${todo.done ? '#ccc' : '#4CAF50'}; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75em;">${todo.done ? '취소' : '완료'}</button>
                <button onclick="deleteTodo('${selectedDateKey}', ${idx})" style="background:#FF5252; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75em; margin-left:4px;">삭제</button>
            </div>
        `;
        listUl.appendChild(li);
    });
}

function addCustomTodo() {
    let input = document.getElementById('newTodoInput');
    let text = input.value.trim();
    if (!text) {
        alert("내용을 입력해주세요!");
        return;
    }

    if (!appData.todos[selectedDateKey]) {
        appData.todos[selectedDateKey] = [];
    }

    appData.todos[selectedDateKey].push({ text: text, done: false });
    input.value = '';
    saveData();
    renderCalendar(2026, 8);
    updateAllUI();
}

function toggleTodo(dateKey, idx) {
    let todo = appData.todos[dateKey][idx];
    todo.done = !todo.done;

    if (todo.done) {
        appData.strength += 2;
        appData.stress = Math.max(0, appData.stress - 3);
    } else {
        appData.strength = Math.max(0, appData.strength - 2);
        appData.stress = Math.min(100, appData.stress + 3);
    }

    saveData();
    updateSelectedDateView();
    updateAllUI();
}

function deleteTodo(dateKey, idx) {
    appData.todos[dateKey].splice(idx, 1);
    saveData();
    renderCalendar(2026, 8);
    updateSelectedDateView();
    updateAllUI();
}

function openSettings() {
    document.getElementById('inputNickname').value = appData.nickname;
    document.getElementById('inputStartWeight').value = appData.startWeight;
    document.getElementById('inputCurrentWeight').value = appData.currentWeight;
    document.getElementById('inputTargetWeight').value = appData.targetWeight;
    document.getElementById('settingsModal').style.display = 'flex';
}
function closeSettings() { document.getElementById('settingsModal').style.display = 'none'; }

function saveSettings() {
    appData.nickname = document.getElementById('inputNickname').value.trim() || "플레이어";
    appData.startWeight = parseFloat(document.getElementById('inputStartWeight').value) || 65;
    appData.currentWeight = parseFloat(document.getElementById('inputCurrentWeight').value) || 65;
    appData.targetWeight = parseFloat(document.getElementById('inputTargetWeight').value) || 50;
    saveData();
    closeSettings();
    updateAllUI();
}

function updateAllUI() {
    let today = new Date();
    let todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    document.getElementById('headerNickname').innerText = appData.nickname;
    document.getElementById('currentDateDisplay').innerText = `오늘: ${today.getMonth() + 1}월 ${today.getDate()}일`;
    document.getElementById('displayStartWeight').innerText = appData.startWeight;
    document.getElementById('displayWeight').innerText = appData.currentWeight.toFixed(1);
    document.getElementById('displayTargetWeight').innerText = appData.targetWeight;

    let totalDrop = appData.startWeight - appData.targetWeight;
    let currentDrop = appData.startWeight - appData.currentWeight;
    let percent = totalDrop <= 0 ? 0 : Math.min(100, Math.max(0, (currentDrop / totalDrop) * 100));
    
    document.getElementById('weightProgressBar').style.width = percent + '%';
    document.getElementById('weightProgressText').innerText = `감량률 ${Math.round(percent)}%`;

    document.getElementById('strBar').style.width = Math.min(100, appData.strength) + '%';
    document.getElementById('strText').innerText = `${appData.strength} P`;
    document.getElementById('endBar').style.width = Math.min(100, appData.endurance) + '%';
    document.getElementById('endText').innerText = `${appData.endurance} P`;
    
    let stressBar = document.getElementById('stressBar');
    stressBar.style.width = appData.stress + '%';
    document.getElementById('stressText').innerText = `${appData.stress} / 100`;

    let todayListUl = document.getElementById('todayTodoList');
    todayListUl.innerHTML = '';
    let todayTodos = appData.todos[todayKey] || [];
    
    if (todayTodos.length === 0) {
        todayListUl.innerHTML = `<li style="text-align:center; color:#888; font-size:0.8em; border:none; background:none;">오늘 등록된 일정이 없습니다. (스케줄 탭에서 추가)</li>`;
        document.getElementById('todayTodoCount').innerText = `0개 완료`;
        return;
    }

    let completedCount = 0;
    todayTodos.forEach((todo, idx) => {
        if(todo.done) completedCount++;
        let li = document.createElement('li');
        if (todo.done) li.className = 'completed';
        li.innerHTML = `
            <span>${todo.text}</span>
            <button onclick="toggleTodo('${todayKey}', ${idx})" style="background:${todo.done ? '#ccc' : '#4CAF50'}; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75em;">${todo.done ? '완료됨' : '완수'}</button>
        `;
        todayListUl.appendChild(li);
    });
    document.getElementById('todayTodoCount').innerText = `${completedCount} / ${todayTodos.length} 완료`;
}