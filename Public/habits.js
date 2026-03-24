let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}

function addHabit() {
    const input = document.getElementById("habitInput");
    const name = input.value.trim();
    if (!name) return;

    habits.push({
        name,
        dates: []
    });

    input.value = "";
    saveHabits();
    render();
}

function toggleHabit(index) {
    const today = getToday();
    const habit = habits[index];

    if (habit.dates.includes(today)) {
        habit.dates = habit.dates.filter(d => d !== today);
    } else {
        habit.dates.push(today);
    }

    saveHabits();
    render();
}

function deleteHabit(index) {
    habits.splice(index, 1);
    saveHabits();
    render();
}

function editHabit(index) {
    const newName = prompt("Edit habit name:", habits[index].name);
    if (newName && newName.trim()) {
        habits[index].name = newName.trim();
        saveHabits();
        render();
    }
}

function calculateStreak(dates) {
    let streak = 0;
    let current = new Date();

    while (dates.includes(current.toISOString().split("T")[0])) {
        streak++;
        current.setDate(current.getDate() - 1);
    }

    return streak;
}

function renderTracker() {
    const list = document.getElementById("habitList");
    list.innerHTML = "";

    habits.forEach((habit, index) => {
        const checked = habit.dates.includes(getToday());

        list.innerHTML += `
            <div class="habit-item">
                <div class="habit-left">
                    <input type="checkbox" ${checked ? "checked" : ""}
                        onchange="toggleHabit(${index})">
                    <span>${habit.name}</span>
                </div>
                <div class="actions">
                    <button onclick="editHabit(${index})">✏️</button>
                    <button onclick="deleteHabit(${index})">🗑️</button>
                </div>
            </div>
        `;
    });
}

function renderHistory() {
    const container = document.getElementById("habitHistory");
    container.innerHTML = "";

    const days = getLast7Days();

    container.innerHTML += `
        <div class="history-row history-header">
            <div>Habit</div>
            ${days.map(d => `<div class="day">${new Date(d).getDate()}</div>`).join("")}
            <div>Streak</div>
        </div>
    `;

    habits.forEach(habit => {
        const streak = calculateStreak(habit.dates);

        container.innerHTML += `
            <div class="history-row">
                <div>${habit.name}</div>
                ${days.map(d => `
                    <div class="circle ${habit.dates.includes(d) ? "completed" : ""}"></div>
                `).join("")}
                <div class="streak">${streak}</div>
            </div>
        `;
    });
}

function render() {
    renderTracker();
    renderHistory();
}

document.querySelector(".add-btn").addEventListener("click", addHabit);

render();