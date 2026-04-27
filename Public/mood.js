let moods = JSON.parse(localStorage.getItem("moods")) || [];
let selectedMood = null;

const options = document.querySelectorAll(".mood-option");
const reflectionBox = document.getElementById("reflectionBox");
const selectedMoodTitle = document.getElementById("selectedMoodTitle");
const moodNote = document.getElementById("moodNote");
const historyContainer = document.getElementById("moodHistory");
const groundingOverlay = document.getElementById("groundingOverlay");

// Select Mood
options.forEach(option => {
    option.addEventListener("click", () => {
        const name = option.querySelector(".label").innerText;
        const emoji = option.querySelector(".emoji").innerText;

        selectedMood = { emoji, name };
        selectedMoodTitle.innerText = `Feeling ${name}?`;
        reflectionBox.style.display = "block";
        moodNote.focus();
    });
});

// Toggle Tag Function
window.toggleTag = function(element) {
    element.classList.toggle("selected");
    
    const tagName = element.innerText;
    let currentNote = moodNote.value;

    if (element.classList.contains("selected")) {
        if (!currentNote.includes(tagName)) {
            moodNote.value = currentNote ? `${currentNote} ${tagName}` : tagName;
        }
    } else {
        moodNote.value = currentNote.replace(tagName, "").trim();
    }
    // Update draft whenever a tag changes the text
    localStorage.setItem("moodNoteDraft", moodNote.value);
}

// Save Mood
const saveBtn = document.querySelector(".save-mood-btn");
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        if (!selectedMood) {
            alert("Please select a mood emoji first!");
            return;
        }

        const entry = {
            id: Date.now(),
            mood: selectedMood.name,
            emoji: selectedMood.emoji,
            note: moodNote.value,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        moods.unshift(entry);
        localStorage.setItem("moods", JSON.stringify(moods));

        if (selectedMood.name.toLowerCase().includes("anxious")) {
            if (groundingOverlay) {
                groundingOverlay.style.display = "block";
                groundingOverlay.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Cleanup
        document.querySelectorAll(".mood-tag").forEach(tag => tag.classList.remove("selected"));
        localStorage.removeItem("moodNoteDraft");
        moodNote.value = "";
        reflectionBox.style.display = "none";
        selectedMood = null;
        renderHistory();
    });
}

// Delete Entry
window.deleteEntry = function(id) {
    if(confirm("Delete this mood log?")) {
        moods = moods.filter(m => m.id !== id);
        localStorage.setItem("moods", JSON.stringify(moods));
        renderHistory();
    }
}

// Render History
function renderHistory() {
    if (!historyContainer) return;
    historyContainer.innerHTML = "";
    
    if (moods.length === 0) {
        historyContainer.innerHTML = "<p style='color:var(--text-muted); padding:20px; text-align:center;'>No moods logged yet.</p>";
        return;
    }

    moods.forEach(entry => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <div class="history-emoji">${entry.emoji}</div>
            <div class="history-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <strong>${entry.mood}</strong>
                    <button class="delete-btn" onclick="deleteEntry(${entry.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                <p style="margin-top: 4px;">${entry.note || ""}</p>
                <small style="display: block; margin-top: 8px; color: var(--text-muted);">${entry.date}</small>
            </div>
        `;
        historyContainer.appendChild(div);
    });
}

// initialisation
renderHistory();

// Handle Drafts
const savedMoodNote = localStorage.getItem("moodNoteDraft");
if (savedMoodNote && savedMoodNote.trim() !== "") {
    moodNote.value = savedMoodNote;
    // show the box so they know a draft exists
    reflectionBox.style.display = "block";
    selectedMoodTitle.innerText = "Continue your draft...";
}

moodNote.addEventListener("input", (e) => {
    localStorage.setItem("moodNoteDraft", e.target.value);
});

// Close Grounding Overlay
window.closeGrounding = function() {
    if (groundingOverlay) {
        groundingOverlay.style.display = "none";
        // Smoothly scroll back up to the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};