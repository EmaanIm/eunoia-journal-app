// Navigation 
function goTo(page) {
    window.location.href = page;
}

// Clock & Greeting
function updateOrientation() {
    const now = new Date();
    const hour = now.getHours();
    
    const clockEl = document.getElementById("visualClock");
    if (clockEl) {
        clockEl.innerText = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    const greetEl = document.getElementById("dynamicGreeting");
    if (greetEl) {
        if (hour < 12) {
            greetEl.innerText = "Take your time waking up. One small step today?";
        } else if (hour < 17) {
            greetEl.innerText = "The afternoon is here. You're doing enough.";
        } else {
            greetEl.innerText = "Evening time. Let's start slowing down.";
        }
    }
}

// Energy Levels 
function setEnergy(level, btn) {
    if (!btn) return;

    // Store state BEFORE resetting
    const wasAlreadyActive = btn.classList.contains('active');

    // Clear 'active' class from ALL buttons
    document.querySelectorAll('.energy-btn').forEach(b => {
        b.classList.remove('active');
    });

    // Toggle Logic
    if (wasAlreadyActive) {
        // Deselect
        localStorage.removeItem("userEnergy");
        updateTaskCountByEnergy(null);
        console.log("Deselected energy");
    } else {
        // Select
        btn.classList.add('active');
        localStorage.setItem("userEnergy", level);
        updateTaskCountByEnergy(level);
        console.log("Selected energy:", level);
    }
}

// Function to update the To-Do card UI based on Energy
function updateTaskCountByEnergy(level) {
    const tasks = JSON.parse(localStorage.getItem("eunoiaTasks")) || [];
    const countEl = document.getElementById("energyTaskCount");
    const subtextEl = document.getElementById("todoSubtext");
    
    if (!countEl || !subtextEl) return;

    const activeTasks = tasks.filter(t => !t.completed);
    let matchCount = 0;
    let message = "Manage your daily goals and tasks";

    if (level === 'low') {
        matchCount = activeTasks.filter(t => t.priority === "!").length;
        message = `You have ${matchCount} low-effort tasks available.`;
    } else if (level === 'med') {
        matchCount = activeTasks.filter(t => t.priority === "!!" || t.priority === "!").length;
        message = `You have ${matchCount} tasks within your capacity.`;
    } else if (level === 'high') {
        matchCount = activeTasks.length;
        message = "You're at full capacity. All tasks visible.";
    }

    // Update UI display
    if (level && matchCount >= 0) {
        countEl.innerText = matchCount;
        countEl.style.display = "inline-block";
        subtextEl.innerText = message;
        subtextEl.style.color = "var(--accent-blue)";
    } else {
        countEl.style.display = "none";
        subtextEl.innerText = "Manage your daily goals and tasks";
        subtextEl.style.color = "var(--text-muted)";
    }
}

// initialisation

updateOrientation();
setInterval(updateOrientation, 1000);

window.addEventListener('DOMContentLoaded', () => {
    const savedEnergy = localStorage.getItem("userEnergy");
    
    // make sure UI matches the saved state on refresh
    if (savedEnergy) {
        const buttons = document.querySelectorAll('.energy-btn');
        if (savedEnergy === 'low' && buttons[0]) buttons[0].classList.add('active');
        if (savedEnergy === 'med' && buttons[1]) buttons[1].classList.add('active');
        if (savedEnergy === 'high' && buttons[2]) buttons[2].classList.add('active');
        
        updateTaskCountByEnergy(savedEnergy);
    } else {
        // reset if nothing is saved
        updateTaskCountByEnergy(null);
    }
});