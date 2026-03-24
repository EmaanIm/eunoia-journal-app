let moods = JSON.parse(localStorage.getItem("moods")) || [];
let selectedMood = null;

const options = document.querySelectorAll(".mood-option");
const reflectionBox = document.getElementById("reflectionBox");
const selectedMoodTitle = document.getElementById("selectedMoodTitle");
const moodNote = document.getElementById("moodNote");
const historyContainer = document.getElementById("moodHistory");

// Select mood
options.forEach(option => {
    option.addEventListener("click", () => {
        const emoji = option.childNodes[0].textContent.trim(); // emoji text node
        const name = option.querySelector("span").innerText;   // mood text

        selectedMood = { emoji, name };

        selectedMoodTitle.innerText = name;
        reflectionBox.style.display = "flex";
        moodNote.focus();
    });
});

// Save mood
document.querySelector(".save-mood-btn").addEventListener("click", () => {
    if (!selectedMood) return;

    const entry = {
        id: Date.now(),
        mood: selectedMood.name,
        emoji: selectedMood.emoji,
        note: moodNote.value,
        date: new Date().toLocaleString()
    };

    moods.unshift(entry);
    localStorage.setItem("moods", JSON.stringify(moods));

    moodNote.value = "";
    reflectionBox.style.display = "none";
    selectedMood = null;

    renderHistory();
});

// Render history
function renderHistory() {
    historyContainer.innerHTML = "";

    moods.forEach(entry => {
        const div = document.createElement("div");
        div.className = "mood-entry";

        div.innerHTML = `
            <div class="mood-entry-left">
                <div class="mood-entry-emoji">${entry.emoji}</div>
                <div>
                    <h4>${entry.mood}</h4>
                    <p>${entry.note || ""}</p>
                </div>
            </div>
            <small>${entry.date}</small>
            <span class="delete-emoji" data-id="${entry.id}" style="cursor:pointer;">🗑️</span>
        `;

        historyContainer.appendChild(div);
    });
}

// Delete using event delegation (this works reliably)
historyContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-emoji")) {
        const id = Number(e.target.dataset.id);
        moods = moods.filter(m => m.id !== id);
        localStorage.setItem("moods", JSON.stringify(moods));
        renderHistory();
    }
});


renderHistory();