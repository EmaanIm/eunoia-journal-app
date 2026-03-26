// --- INITIAL STATE ---
let tasks = JSON.parse(localStorage.getItem("eunoiaTasks")) || [];
let currentFilter = "all";
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds

// --- TASK & SUB-TASK LOGIC ---
function addTask() {
    const text = document.getElementById("taskInput").value.trim();
    const deadline = document.getElementById("deadlineInput").value;
    const subInputFields = document.querySelectorAll(".sub-input-field");
    
    if (!text || !deadline) {
        alert("Please enter a task and a deadline.");
        return;
    }

    // Capture non-empty sub-tasks
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

    // Clear inputs
    document.getElementById("taskInput").value = "";
    subInputFields.forEach(f => f.value = "");
    saveAndRender();
}

// FIXED: Added missing Priority Calculation
function calculatePriority(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3) return "!!!";
    if (diff <= 7) return "!!";
    return "!";
}

// FIXED: Added missing Toggle and Delete functions
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function toggleSubTask(taskId, subIdx) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subTasks[subIdx]) {
        task.subTasks[subIdx].completed = !task.subTasks[subIdx].completed;
        saveAndRender();
    }
}

// NEW: Filter Logic
function filterTasks(priority) {
    currentFilter = priority;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        const isMatch = (priority === "all" && btn.innerText === "All") || btn.innerText === priority;
        btn.classList.toggle("active", isMatch);
    });
    renderTasks();
}

// FIXED: Added Deadline Sorting Logic
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
                        <input type="checkbox" ${sub.completed ? 'checked' : ''} onclick="toggleSubTask(${task.id}, ${idx})" style="width: 14px; height: 14px;">
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
                    <button onclick="deleteTask(${task.id})" style="background: none; border: none; color: #c97b7b; cursor: pointer;">🗑️</button>
                </div>
            </div>
            ${subHtml}
        `;
        list.appendChild(div);
    });
    
    const pendingEl = document.getElementById("pendingCount");
    if (pendingEl) pendingEl.innerText = tasks.filter(t => !t.completed).length;
}

// --- FOCUS TIMER LOGIC ---
function toggleTimer() {
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
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    document.getElementById("timerBtn").innerText = "Start Focus";
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timerDisplay").innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 2. REPLACE YOUR EXISTING saveAndRender FUNCTION
function saveAndRender() {
    // This line converts your tasks into a string and saves it
    localStorage.setItem("eunoiaTasks", JSON.stringify(tasks));
    
    renderTasks();
    
    // Check if updateDeadlines exists before calling it to prevent errors
    if (typeof updateDeadlines === "function") {
        updateDeadlines();
    }
}

// Initial Load
window.onload = function() {
    renderTasks();
    updateDeadlines();
};