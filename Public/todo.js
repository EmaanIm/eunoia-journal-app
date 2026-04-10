// --- INITIAL STATE ---
let tasks = JSON.parse(localStorage.getItem("eunoiaTasks")) || [];
let currentFilter = "all";
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds

// --- CORE UTILITIES ---
function saveAndRender() {
    localStorage.setItem("eunoiaTasks", JSON.stringify(tasks));
    renderTasks();
    if (typeof updateDeadlines === "function") updateDeadlines();
}

function calculatePriority(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3) return "!!!";
    if (diff <= 7) return "!!";
    return "!";
}

// --- TASK ACTIONS ---
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const deadlineInput = document.getElementById("deadlineInput");
    const subInputFields = document.querySelectorAll(".sub-input-field");
    
    const text = taskInput.value.trim();
    const deadline = deadlineInput.value;
    
    if (!text || !deadline) {
        alert("Please enter a task and a deadline.");
        return;
    }

    let subTasks = [];
    subInputFields.forEach(field => {
        if (field.value.trim() !== "") {
            subTasks.push({ text: field.value.trim(), completed: false });
        }
    });

    tasks.push({
        id: Date.now(),
        text: text,
        deadline: deadline,
        completed: false,
        priority: calculatePriority(deadline),
        subTasks: subTasks 
    });

    taskInput.value = "";
    deadlineInput.value = "";
    subInputFields.forEach(f => f.value = "");

    localStorage.removeItem("todoTaskDraft");
    
    saveAndRender();
}

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
};

window.toggleSubTask = function(taskId, subIdx) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subTasks[subIdx]) {
        task.subTasks[subIdx].completed = !task.subTasks[subIdx].completed;
        saveAndRender();
    }
};

// --- FILTER LOGIC ---
window.filterTasks = function(priority) {
    currentFilter = priority;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        const btnText = btn.innerText.trim();
        const isMatch = (priority === "all" && btnText === "All") || btnText === priority;
        btn.classList.toggle("active", isMatch);
    });
    renderTasks();
};

// --- RENDERING ---
function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = "";

    const filtered = tasks.filter(t => currentFilter === "all" || t.priority === currentFilter);

    filtered.forEach(task => {
        const div = document.createElement("div");
        div.className = `item ${task.completed ? 'completed' : ''}`;
        const accent = task.priority === '!!!' ? '#c97b7b' : (task.priority === '!!' ? 'var(--accent-blue)' : '#d1d9e0');
        div.style.borderLeft = `5px solid ${accent}`;
        
        let subHtml = "";
        if (task.subTasks && task.subTasks.length > 0) {
            subHtml = `<div class="sub-task-list" style="margin-top: 10px; padding-left: 35px; border-top: 1px solid #f0f0f0; padding-top: 10px;">`;
            task.subTasks.forEach((sub, idx) => {
                subHtml += `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 0.85rem; color: #5d7382;">
                        <input type="checkbox" ${sub.completed ? 'checked' : ''} onclick="toggleSubTask(${task.id}, ${idx})">
                        <span style="${sub.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${sub.text}</span>
                    </div>`;
            });
            subHtml += `</div>`;
        }

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})" style="width: 18px; height: 18px;">
                    <span style="font-weight: 600; ${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.text}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: ${accent}">${task.priority}</span>
                    <button class="delete-btn" onclick="deleteTask(${task.id})" style="background:none; border:none; cursor:pointer; color:#bcc6cc;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            ${subHtml}
        `;
        list.appendChild(div);
    });
    
    const pendingCount = document.getElementById("pendingCount");
    if (pendingCount) pendingCount.innerText = tasks.filter(t => !t.completed).length;
}

function updateDeadlines() {
    const deadlineList = document.getElementById("deadlineList");
    if (!deadlineList) return;

    let activeDeadlines = tasks.filter(t => !t.completed && t.deadline);
    activeDeadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    deadlineList.innerHTML = "";
    activeDeadlines.forEach(task => {
        const today = new Date();
        const dueDate = new Date(task.deadline);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        let label = diffDays <= 3 ? "Urgent" : "Soon";
        let color = diffDays <= 3 ? "#c97b7b" : "var(--accent-blue)";
        if (diffDays < 0) { label = "Overdue"; color = "#a34b4b"; }
        
        const pill = document.createElement("div");
        pill.className = "deadline-pill";
        pill.innerHTML = `<strong style="color: ${color};">${label}:</strong> ${task.text} (${diffDays}d)`;
        deadlineList.appendChild(pill);
    });
}

// --- FOCUS TIMER LOGIC ---
window.toggleTimer = function() {
    const btn = document.getElementById("timerBtn");
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.innerText = "Resume Focus";
    } else {
        btn.innerText = "Pause";
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Time's up! Take a short break.");
                resetTimer();
            }
        }, 1000);
    }
};

window.resetTimer = function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    const btn = document.getElementById("timerBtn");
    if (btn) btn.innerText = "Start Focus";
};

function updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");
    if (!display) return;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".add-task-btn");
    if(addBtn) addBtn.addEventListener("click", addTask);

    // 1. LOAD DRAFT
    const savedTask = localStorage.getItem("todoTaskDraft");
    if (savedTask) document.getElementById("taskInput").value = savedTask;

    // 2. ATTACH DRAFT LISTENER
    document.getElementById("taskInput").addEventListener("input", (e) => {
        localStorage.setItem("todoTaskDraft", e.target.value);
    });

    renderTasks();
    updateDeadlines();
    updateTimerDisplay();
});