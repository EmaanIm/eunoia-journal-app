let tasks = [];
let currentFilter = "all";

function calculatePriority(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff <= 7) return "!!!";
    if (diff <= 14) return "!!";
    return "!";
}

function addTask() {
    const text = document.getElementById("taskInput").value;
    const deadline = document.getElementById("deadlineInput").value;
    if (!text || !deadline) return;

    tasks.push({
        id: Date.now(),
        text,
        deadline,
        priority: calculatePriority(deadline)
    });

    document.getElementById("taskInput").value = "";
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit task:", task.text);
    if (newText) {
        task.text = newText;
        renderTasks();
    }
}

function filterTasks(priority) {
    currentFilter = priority;
    document.querySelectorAll(".filter button").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks
        .filter(task => currentFilter === "all" || task.priority === currentFilter)
        .forEach(task => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <div class="item-left">
                    <span>${task.text}</span>
                </div>
                <div class="item-right">
                    <span class="priority">${task.priority}</span>
                    <small>${task.deadline}</small>
                    <button onclick="editTask(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">X</button>
                </div>
            `;
            list.appendChild(div);
        });
}
