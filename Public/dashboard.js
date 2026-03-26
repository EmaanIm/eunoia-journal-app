// 1. Navigation Logic
function goTo(page) {
  window.location.href = page;
}

// 2. Orientation Logic (Clock & Dynamic Greeting)
function updateOrientation() {
  const now = new Date();
  const hour = now.getHours();
  
  // Update the Visual Time Anchor
  const clockEl = document.getElementById("visualClock");
  if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
      });
  }

  // Update the Low-Demand Greeting
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

// 3. Capacity Logic (Energy Levels)
function setEnergy(level, btn) {
  // Remove active styling from all buttons
  document.querySelectorAll('.energy-btn').forEach(b => {
      b.classList.remove('active');
      // Reset manual styles if any were applied by the browser
      b.style.background = "";
      b.style.borderColor = "";
  });

  // Add active styling to the clicked button
  if (btn) {
      btn.classList.add('active');
  }

  // Save choice to localStorage so the To-Do page can see it
  localStorage.setItem("userEnergy", level);
  console.log("Capacity set to:", level);
}

// --- INITIALIZATION ---

// Update clock immediately on load
updateOrientation();

// Update clock every 1 second (to keep time accurate)
setInterval(updateOrientation, 1000);

// Check if there was a previously saved energy level and highlight it
window.addEventListener('DOMContentLoaded', () => {
  const savedEnergy = localStorage.getItem("userEnergy");
  if (savedEnergy) {
      const buttons = document.querySelectorAll('.energy-btn');
      // This is a simple way to find the right button based on the stored level
      if (savedEnergy === 'low') buttons[0].classList.add('active');
      if (savedEnergy === 'med') buttons[1].classList.add('active');
      if (savedEnergy === 'high') buttons[2].classList.add('active');
  }
});

// Function to update the To-Do card based on Energy
function updateTaskCountByEnergy(level) {
  const tasks = JSON.parse(localStorage.getItem("eunoiaTasks")) || [];
  const countEl = document.getElementById("energyTaskCount");
  const subtextEl = document.getElementById("todoSubtext");
  
  // Filter for incomplete tasks only
  const activeTasks = tasks.filter(t => !t.completed);
  
  let matchCount = 0;
  let message = "";

  // Energy Mapping Logic
  // Low Energy (🔋) = Priority "!"
  // Med Energy (🔋🔋) = Priority "!!"
  // High Energy (🔋🔋🔋) = Priority "!!!" (or all tasks)
  
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

  // Update the UI
  if (matchCount > 0) {
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

// Update the setEnergy function to trigger the UI change
function setEnergy(level, btn) {
  document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  localStorage.setItem("userEnergy", level);
  
  // NEW: Update the To-Do card immediately
  updateTaskCountByEnergy(level);
}

// Initial call on page load to check if an energy level was already saved
window.addEventListener('DOMContentLoaded', () => {
  const savedEnergy = localStorage.getItem("userEnergy");
  if (savedEnergy) {
      updateTaskCountByEnergy(savedEnergy);
  }
});