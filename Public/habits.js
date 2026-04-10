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
        days.push({
            full: d.toISOString().split("T")[0],
            short: d.toLocaleDateString('en-US', { weekday: 'short' }),
            num: d.getDate()
        });
    }
    return days;
}

// Add New Habit
document.querySelector(".habit-add-btn").addEventListener("click", () => {
    const input = document.getElementById("habitInput");
    const name = input.value.trim();
    if (!name) return;

    habits.push({ id: Date.now(), name, dates: [] });
    input.value = "";
    saveHabits();
    render();
});

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

function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    render();
}

function calculateStreak(dates) {
    let streak = 0;
    let checkDate = new Date();
    while (dates.includes(checkDate.toISOString().split("T")[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
}

function render() {
    const habitList = document.getElementById("habitList");
    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("habitHistoryBody");
    const days = getLast7Days();

    // 1. Render Upper Tracker
    // Inside your render function, update the habitList.innerHTML mapping:

habitList.innerHTML = habits.map((habit, index) => `
<div class="habit-item">
    <div class="habit-left">
        <input type="checkbox" class="habit-checkbox" 
            ${habit.dates.includes(getToday()) ? "checked" : ""} 
            onchange="toggleHabit(${index})">
        <span style="font-weight:500; color:#3f5363;">${habit.name}</span>
    </div>
    <div class="habit-actions">
        <button class="delete-btn" onclick="deleteHabit(${habit.id})" aria-label="Delete habit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        </button>
    </div>
</div>
`).join("");

    // 2. Render Table Header
    tableHeader.innerHTML = `<th>Habit</th>` + 
        days.map(d => `<th>${d.short}<br>${d.num}</th>`).join("") + 
        `<th>Streak</th>`;

    // 3. Render Table Rows
    tableBody.innerHTML = habits.map(habit => {
        const streak = calculateStreak(habit.dates);
        return `
            <tr>
                <td>${habit.name}</td>
                ${days.map(d => `
                    <td><div class="table-dot ${habit.dates.includes(d.full) ? "completed" : ""}"></div></td>
                `).join("")}
                <td><span class="streak-badge">${streak}</span></td>
            </tr>
        `;
    }).join("");
}

render();