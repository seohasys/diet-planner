let appData = JSON.parse(localStorage.getItem('diet_planner_data_v13')) || {
    nickname: "플레이어",
    startWeight: 65.0,
    currentWeight: 65.0,
    targetWeight: 50.0,
    startDate: "2026-08-01",
    level: 1,
    exp: 0,
    maxExp: 100,
    strength: 10,
    endurance: 10,
    stress: 10,
    todos: {},
    healingQuests: {},
    templates: [
        "미온수 마시기",
        "식단 조절하기",
        "유산소 운동 30분",
        "물 2L 마시기",
        "스트레칭"
    ],
    achievements: {
        first_quest: false,
        level_3: false,
        level_5: false,
        level_10: false,
        weight_drop_1kg: false,
        weight_drop_3kg: false,
        weight_drop_5kg: false,
        stress_zero: false,
        healing_complete: false,
        goal_success: false
    }
};

let selectedDateKey = "";
let currentViewYear = 2026;
let currentViewMonth = 8;

const healingQuestPool = [
    { text: "따뜻한 차 마시며 10분 휴식하기", stressRelief: 15 },
    { text: "좋아하는 음악 들으며 가볍게 산책하기", stressRelief: 25 },
    { text: "스마트폰 멀리하고 15분 낮잠 자기", stressRelief: 30 },
    { text: "반신욕이나 따뜻한 물로 샤워하기", stressRelief: 35 },
    { text: "좋아하는 영상 보며 뇌 비우기", stressRelief: 20 },
    { text: "가벼운 스트레칭으로 몸 풀기", stressRelief: 15 }
];

window.onload = function() {
    let today = new Date();
    selectedDateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    currentViewYear = today.getFullYear();
    currentViewMonth = today.getMonth() + 1;

    generateDailyHealingQuests();

    checkAchievements();
    updateAllUI();
    renderCalendar(currentViewYear, currentViewMonth);
    renderTemplates();
};

function saveData() {
    localStorage.setItem('diet_planner_data_v13', JSON.stringify(appData));
}

function generateDailyHealingQuests() {
    let today = new Date();
    let todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    if (!appData.healingQuests[todayKey]) {
        let shuffled = [...healingQuestPool].sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 3).map(q => ({
            text: q.text,
            done: false,
            stressRelief: q.stressRelief
        }));
        appData.healingQuests[todayKey] = selected;
    }
}

function switchTab(tabName, btnElem) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).style.display = 'block';
    btnElem.classList.add('active');
    if(tabName === 'home') updateAllUI();
    if(tabName === 'schedule') {
        renderCalendar(currentViewYear, currentViewMonth);
        renderTemplates();
    }
    if(tabName === 'achievements') renderAchievementsUI();
}

function changeMonth(direction) {
    currentViewMonth += direction;
    if (currentViewMonth > 12) {
        currentViewMonth = 1;
        currentViewYear++;
    } else if (currentViewMonth < 1) {
        currentViewMonth = 12;
        currentViewYear--;
    }
    renderCalendar(currentViewYear, currentViewMonth);
}

function renderCalendar(year, month) {
    let grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    document.getElementById('calendarTitle').innerText = `${year}년 ${month}월`;

    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
    daysOfWeek.forEach(d => {
        let h = document.createElement('div');
        h.className = 'cal-day-header';
        h.innerText = d;
        grid.appendChild(h);
    });

    let lastDay = new Date(year, month, 0).getDate();
    let firstDayIndex = new Date(year, month - 1, 1).getDay();
    let startingEmptyCells = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    for (let i = 0; i < startingEmptyCells; i++) {
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

function renderTemplates() {
    let container = document.getElementById('templateChips');
    container.innerHTML = '';
    appData.templates.forEach(templateText => {
        let chip = document.createElement('button');
        chip.className = 'template-chip';
        chip.innerText = `+ ${templateText}`;
        chip.onclick = function() {
            addTodoDirectly(templateText);
        };
        container.appendChild(chip);
    });
}

function addTodoDirectly(text) {
    if (!appData.todos[selectedDateKey]) {
        appData.todos[selectedDateKey] = [];
    }
    appData.todos[selectedDateKey].push({ text: text, done: false });
    saveData();
    renderCalendar(currentViewYear, currentViewMonth);
    updateSelectedDateView();
    updateAllUI();
}

function updateSelectedDateView() {
    let parts = selectedDateKey.split('-');
    document.getElementById('selectedDateTitle').innerText = `📅 ${parts[1]}월 ${parts[2]}일 루틴 관리`;
    
    let listUl = document.getElementById('selectedDateTodoList');
    listUl.innerHTML = '';

    let dayTodos = appData.todos[selectedDateKey] || [];
    if (dayTodos.length === 0) {
        listUl.innerHTML = `<li style="text-align:center; color:#888; font-size:0.8em; border:none; background:none;">등록된 루틴이 없습니다.</li>`;
        return;
    }

    dayTodos.forEach((todo, idx) => {
        let li = document.createElement('li');
        if (todo.done) li.className = 'completed';
        li.innerHTML = `
            <span style="${todo.done ? 'text-decoration:line-through; color:#aaa;' : ''}">${todo.text}</span>
            <div>
                <button onclick="toggleTodo('${selectedDateKey}', ${idx})" style="background:${todo.done ? '#ddd' : '#333'}; color:${todo.done ? '#666' : '#fff'}; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:0.75em;">${todo.done ? '완료취소' : '완료'}</button>
                <button onclick="deleteTodo('${selectedDateKey}', ${idx})" style="background:#fee2e2; color:#ef4444; border:none; padding:3px 6px; border-radius:4px; cursor:pointer; font-size:0.75em; margin-left:4px;">삭제</button>
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
    addTodoDirectly(text);
    input.value = '';
}

function toggleTodo(dateKey, idx) {
    let todo = appData.todos[dateKey][idx];
    todo.done = !todo.done;

    if (todo.done) {
        gainExp(35);
        appData.strength += 2;
        appData.stress = Math.min(100, appData.stress + 5);
        appData.achievements.first_quest = true;

        if (Math.random() < 0.3) {
            triggerRandomEvent();
        }
    } else {
        appData.exp = Math.max(0, appData.exp - 35);
        appData.strength = Math.max(0, appData.strength - 2);
        appData.stress = Math.max(0, appData.stress - 5);
    }

    checkAchievements();
    saveData();
    updateSelectedDateView();
    updateAllUI();
}

function toggleHealingQuest(dateKey, idx) {
    let quest = appData.healingQuests[dateKey][idx];
    quest.done = !quest.done;

    if (quest.done) {
        appData.stress = Math.max(0, appData.stress - quest.stressRelief);
        gainExp(10);
        appData.achievements.healing_complete = true;
    } else {
        appData.stress = Math.min(100, appData.stress + quest.stressRelief);
        appData.exp = Math.max(0, appData.exp - 10);
    }

    checkAchievements();
    saveData();
    updateAllUI();
}

function triggerRandomEvent() {
    const events = [
        { title: "돌발 이벤트: 길거리 붕어빵 유혹!", desc: "참아내어 정신력이 단단해졌습니다!", stressChange: 5, expBonus: 20 },
        { title: "돌발 이벤트: 친구의 야식 권유", desc: "정중히 거절하고 의지를 다졌습니다!", stressChange: 10, expBonus: 30 },
        { title: "돌발 이벤트: 깜짝 컨디션 호조", desc: "몸이 가벼워져 추가 보너스를 얻었습니다!", stressChange: -5, expBonus: 40 }
    ];

    let ev = events[Math.floor(Math.random() * events.length)];
    appData.stress = Math.min(100, Math.max(0, appData.stress + ev.stressChange));
    gainExp(ev.expBonus);

    alert(`✨ ${ev.title}\n${ev.desc}\n(경험치 +${ev.expBonus})`);
}

function gainExp(amount) {
    appData.exp += amount;
    while (appData.exp >= appData.maxExp) {
        appData.exp -= appData.maxExp;
        appData.level++;
        appData.maxExp = Math.floor(appData.maxExp * 1.2);
        alert(`레벨업! Lv.${appData.level}이 되었습니다.`);
    }
}

function deleteTodo(dateKey, idx) {
    appData.todos[dateKey].splice(idx, 1);
    saveData();
    renderCalendar(currentViewYear, currentViewMonth);
    updateSelectedDateView();
    updateAllUI();
}

function checkAchievements() {
    if (appData.level >= 3) appData.achievements.level_3 = true;
    if (appData.level >= 5) appData.achievements.level_5 = true;
    if (appData.level >= 10) appData.achievements.level_10 = true;
    
    let drop = appData.startWeight - appData.currentWeight;
    if (drop >= 1.0) appData.achievements.weight_drop_1kg = true;
    if (drop >= 3.0) appData.achievements.weight_drop_3kg = true;
    if (drop >= 5.0) appData.achievements.weight_drop_5kg = true;
    
    if (appData.stress === 0) appData.achievements.stress_zero = true;
    if (appData.currentWeight <= appData.targetWeight) appData.achievements.goal_success = true;
}

function renderAchievementsUI() {
    let listEl = document.getElementById('achievementList');
    listEl.innerHTML = '';

    const achievementsData = [
        { id: 'first_quest', icon: '🎯', title: '첫 걸음마', desc: '첫 번째 루틴을 완료하세요.' },
        { id: 'level_3', icon: '🌱', title: '습관 형성 (Lv.3)', desc: '레벨 3을 달성하세요.' },
        { id: 'level_5', icon: '⭐', title: '꾸준함의 힘 (Lv.5)', desc: '레벨 5를 달성하세요.' },
        { id: 'level_10', icon: '🔥', title: '베테랑 실천가 (Lv.10)', desc: '레벨 10을 달성하세요.' },
        { id: 'weight_drop_1kg', icon: '🍃', title: '가벼워진 시작 (-1kg)', desc: '시작 체중보다 1kg 이상 감량하세요.' },
        { id: 'weight_drop_3kg', icon: '📉', title: '순항 중 (-3kg)', desc: '시작 체중보다 3kg 이상 감량하세요.' },
        { id: 'weight_drop_5kg', icon: '⚡', title: '대변화 시작 (-5kg)', desc: '시작 체중보다 5kg 이상 감량하세요.' },
        { id: 'stress_zero', icon: '🧘', title: '평온한 멘탈', desc: '스트레스 수치를 0으로 만드세요.' },
        { id: 'healing_complete', icon: '☕', title: '확실한 휴식', desc: '멘탈 케어 퀘스트를 완료하세요.' },
        { id: 'goal_success', icon: '👑', title: '목표 체중 달성!', desc: '목표 체중에 도달하세요.' }
    ];

    achievementsData.forEach(ach => {
        let isUnlocked = appData.achievements[ach.id];
        let li = document.createElement('li');
        li.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
        li.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-info">
                <h4>${ach.title} ${isUnlocked ? '✓' : ''}</h4>
                <p>${ach.desc}</p>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function openSettings() {
    document.getElementById('inputNickname').value = appData.nickname;
    document.getElementById('inputStartWeight').value = appData.startWeight;
    document.getElementById('inputCurrentWeight').value = appData.currentWeight;
    document.getElementById('inputTargetWeight').value = appData.targetWeight;
    document.getElementById('inputStartDate').value = appData.startDate || "2026-08-01";
    document.getElementById('settingsModal').style.display = 'flex';
}
function closeSettings() { document.getElementById('settingsModal').style.display = 'none'; }

function saveSettings() {
    appData.nickname = document.getElementById('inputNickname').value.trim() || "플레이어";
    appData.startWeight = parseFloat(document.getElementById('inputStartWeight').value) || 65;
    appData.currentWeight = parseFloat(document.getElementById('inputCurrentWeight').value) || 65;
    appData.targetWeight = parseFloat(document.getElementById('inputTargetWeight').value) || 50;
    appData.startDate = document.getElementById('inputStartDate').value || "2026-08-01";
    
    checkAchievements();
    saveData();
    closeSettings();
    updateAllUI();
}

function updateAllUI() {
    let today = new Date();
    let todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let todayStringFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    generateDailyHealingQuests();

    document.getElementById('headerLv').innerText = `Lv.${appData.level}`;
    document.getElementById('headerNickname').innerText = appData.nickname;
    document.getElementById('headerStartDate').innerText = `시작: ${appData.startDate}`;
    document.getElementById('headerTodayDate').innerText = `오늘: ${todayStringFormatted}`;
    
    document.getElementById('charLevelText').innerText = `레벨 ${appData.level}`;
    document.getElementById('charExpText').innerText = `EXP ${appData.exp} / ${appData.maxExp}`;
    let expPercent = Math.min(100, (appData.exp / appData.maxExp) * 100);
    document.getElementById('expProgressBar').style.width = expPercent + '%';

    document.getElementById('displayStartWeight').innerText = appData.startWeight;
    document.getElementById('displayWeight').innerText = appData.currentWeight.toFixed(1);
    document.getElementById('displayTargetWeight').innerText = appData.targetWeight;

    // --- 체중 여정 그래프 계산 및 렌더링 로직 ---
    document.getElementById('labelStart').innerText = `${appData.startWeight}kg (시작)`;
    document.getElementById('labelTarget').innerText = `${appData.targetWeight}kg (목표)`;

    let totalDiff = appData.startWeight - appData.targetWeight;
    let currentDiff = appData.startWeight - appData.currentWeight;
    
    let percent = 0;
    if (totalDiff > 0) {
        percent = Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100));
    }

    document.getElementById('journeyProgressBar').style.width = percent + '%';
    document.getElementById('journeyMarker').style.left = percent + '%';
    document.getElementById('markerWeightText').innerText = `${appData.currentWeight.toFixed(1)}kg`;

    let statusTextElem = document.getElementById('journeyStatusText');
    if (appData.currentWeight <= appData.targetWeight) {
        statusTextElem.innerText = `🎉 축하합니다! 목표 체중을 달성하셨습니다! 👑`;
    } else {
        let remain = (appData.currentWeight - appData.targetWeight).toFixed(1);
        statusTextElem.innerText = `목표까지 총 ${remain}kg 남았습니다! 힘내세요! 🔥`;
    }
    // ----------------------------------------

    document.getElementById('strBar').style.width = Math.min(100, appData.strength) + '%';
    document.getElementById('strText').innerText = `${appData.strength} P`;
    document.getElementById('endBar').style.width = Math.min(100, appData.endurance) + '%';
    document.getElementById('endText').innerText = `${appData.endurance} P`;
    
    let stressBar = document.getElementById('stressBar');
    stressBar.style.width = appData.stress + '%';
    document.getElementById('stressText').innerText = `${appData.stress} / 100`;

    // 멘탈 케어 퀘스트 렌더링
    let healingListUl = document.getElementById('healingQuestList');
    healingListUl.innerHTML = '';
    let todayHealing = appData.healingQuests[todayKey] || [];
    
    todayHealing.forEach((q, idx) => {
        let li = document.createElement('li');
        if (q.done) li.className = 'completed';
        li.innerHTML = `
            <span style="${q.done ? 'text-decoration:line-through; color:#aaa;' : ''}">${q.text} <small style="color:#047857; font-weight:bold;">(-${q.stressRelief})</small></span>
            <button onclick="toggleHealingQuest('${todayKey}', ${idx})" style="background:${q.done ? '#ddd' : '#10b981'}; color:${q.done ? '#666' : '#fff'}; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:0.75em;">${q.done ? '완료취소' : '완수'}</button>
        `;
        healingListUl.appendChild(li);
    });

    // 오늘의 루틴 렌더링
    let todayListUl = document.getElementById('todayTodoList');
    todayListUl.innerHTML = '';
    let todayTodos = appData.todos[todayKey] || [];
    
    if (todayTodos.length === 0) {
        todayListUl.innerHTML = `<li style="text-align:center; color:#888; font-size:0.8em; border:none; background:none;">오늘 등록된 루틴이 없습니다.</li>`;
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
            <button onclick="toggleTodo('${todayKey}', ${idx})" style="background:${todo.done ? '#ddd' : '#333'}; color:${todo.done ? '#666' : '#fff'}; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:0.75em;">${todo.done ? '완료취소' : '완료'}</button>
        `;
        todayListUl.appendChild(li);
    });
    document.getElementById('todayTodoCount').innerText = `${completedCount} / ${todayTodos.length} 완료`;
}
