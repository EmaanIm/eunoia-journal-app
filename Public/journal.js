let currentPrompt = "Free Write";
let editingId = null; // Track if we are editing an existing entry
const energyMeter = document.getElementById('energyMeter');
const energyValue = document.getElementById('energyValue');

// --- INITIALIZATION ---
window.onload = () => {
  displayEntries();
  
  // LOAD DRAFT
  const savedDraft = localStorage.getItem("journalDraft");
  if (savedDraft) {
      document.getElementById("journalText").value = savedDraft;
  }

  if (energyMeter) {
      energyMeter.addEventListener('input', updateSliderFill);
      updateSliderFill(); 
  }
};

// --- CORE JOURNAL FUNCTIONS ---
function startEntry(promptText) {
    currentPrompt = promptText;
    editingId = null; // Reset editing mode
    document.getElementById("entryTitle").innerText = promptText;
    document.getElementById("journalText").value = "";
    document.getElementById("journalText").focus();
}

function saveEntry() {
    const text = document.getElementById("journalText").value.trim();
    if (!text) return alert("Please write something first.");

    let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];

    if (editingId) {
        // --- EDIT MODE ---
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            entries[index].content = text;
            entries[index].energy = energyMeter.value;
            // Optionally update the date to show it was edited
            entries[index].date += " (edited)"; 
        }
        editingId = null; // Clear editing state
    } else {
        // --- NEW ENTRY MODE ---
        const entry = {
            id: Date.now(),
            prompt: currentPrompt,
            content: text,
            energy: energyMeter.value,
            date: new Date().toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        };
        entries.unshift(entry);
    }

    localStorage.setItem("journalEntries", JSON.stringify(entries));
    
    document.getElementById("journalText").value = "";
    document.getElementById("entryTitle").innerText = "Free Write";
    displayEntries();
}

function editEntry(id) {
    const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const entryToEdit = entries.find(e => e.id === id);

    if (entryToEdit) {
        editingId = id; // Set the global editing ID
        currentPrompt = entryToEdit.prompt;
        
        // Fill the UI with existing data
        document.getElementById("entryTitle").innerText = `Editing: ${entryToEdit.prompt}`;
        document.getElementById("journalText").value = entryToEdit.content;
        energyMeter.value = entryToEdit.energy;
        updateSliderFill();
        
        // Scroll to the top so the user sees the editor
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById("journalText").focus();
    }
}

function displayEntries() {
    const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const container = document.getElementById("entriesList");
    container.innerHTML = "";

    if (entries.length === 0) {
        container.innerHTML = "<p style='color:var(--text-muted); text-align:center; padding:20px;'>No entries yet. Start writing above!</p>";
        return;
    }

    entries.forEach(entry => {
        const div = document.createElement("div");
        div.className = "entry-card";
        div.innerHTML = `
            <div class="entry-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <strong>${entry.prompt}</strong>
                <span class="energy-badge">⚡ ${entry.energy}/10</span>
            </div>
            <p style="margin: 15px 0;">${entry.content}</p>
            <div class="entry-footer" style="display: flex; justify-content: space-between; align-items: center;">
                <small style="color: var(--text-muted);">${entry.date}</small>
                <div style="display: flex; gap: 10px;">
                    <button class="edit-btn" onclick="editEntry(${entry.id})" aria-label="Edit entry" style="background:none; border:none; cursor:pointer; color:var(--dusty-blue);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="del-btn" onclick="deleteEntry(${entry.id})" aria-label="Delete entry">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteEntry(id) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    localStorage.setItem("journalEntries", JSON.stringify(entries.filter(e => e.id !== id)));
    displayEntries();
}

function updateSliderFill() {
    const val = energyMeter.value;
    const min = energyMeter.min ? energyMeter.min : 1;
    const max = energyMeter.max ? energyMeter.max : 10;
    const percentage = (val - min) * 100 / (max - min);
    energyMeter.style.background = `linear-gradient(to right, #a5b3a0 ${percentage}%, #f2f2f2 ${percentage}%)`;
    energyValue.innerText = `${val}/10`;
}

// --- TOOLKIT LOGIC ---
function closeAllOverlays() {
  ['groundingOverlay', 'bodyScanOverlay', 'reframerOverlay', 'sensoryOverlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
  });
  document.getElementById("mainEntryCard").style.opacity = "1";
}

let groundingIndex = 0;
const groundingSteps = [
  { title: "5 Things you SEE", desc: "Look around. Notice small details like light, patterns, or objects." },
  { title: "4 Things you can TOUCH", desc: "Feel the texture of your clothes, the desk, or your own skin." },
  { title: "3 Things you HEAR", desc: "Listen for distant traffic, bird song, or the hum of a fan." },
  { title: "2 Things you can SMELL", desc: "Notice scents in the air or perhaps a nearby candle or coffee." },
  { title: "1 Thing you can TASTE", desc: "Focus on a lingering taste or take a small sip of water." }
];

function toggleGrounding() {
  const overlay = document.getElementById("groundingOverlay");
  if (overlay.style.display === "none") {
      closeAllOverlays();
      overlay.style.display = "block";
      document.getElementById("mainEntryCard").style.opacity = "0.3";
      groundingIndex = 0;
      updateGroundingUI();
  } else { closeAllOverlays(); }
}

function updateGroundingUI() {
  document.getElementById("groundingStep").innerText = groundingSteps[groundingIndex].title;
  document.getElementById("groundingDesc").innerText = groundingSteps[groundingIndex].desc;
}

function nextGroundingStep() {
  groundingIndex++;
  if (groundingIndex < groundingSteps.length) { updateGroundingUI(); } 
  else {
      closeAllOverlays();
      startEntry("Post-Grounding Reflection");
      document.getElementById("journalText").value = "I have completed my grounding. Right now, I feel...";
  }
}

function toggleBodyScan() {
  const el = document.getElementById("bodyScanOverlay");
  el.style.display === "none" ? (closeAllOverlays(), el.style.display = "block") : closeAllOverlays();
}

function logBodyPart(part) {
  document.getElementById("journalText").value += `\n[Body Scan: Tension/Sensation in ${part}] `;
  toggleBodyScan();
}

function toggleReframer() {
  const el = document.getElementById("reframerOverlay");
  el.style.display === "none" ? (closeAllOverlays(), el.style.display = "block") : closeAllOverlays();
}

function reframe(type) {
  document.getElementById("journalText").value += `\n[Cognitive Check: Recognizing this as a ${type.toUpperCase()}] `;
  toggleReframer();
}

function toggleSensory() {
  const el = document.getElementById("sensoryOverlay");
  if (el.style.display === "none") { closeAllOverlays(); el.style.display = "block"; nextSensory(); } 
  else { closeAllOverlays(); }
}

function nextSensory() {
  const tasks = ["Splash cold water on your face.", "Hold an ice cube.", "Push against a wall.", "Hum a low note."];
  document.getElementById("sensoryTask").innerText = tasks[Math.floor(Math.random() * tasks.length)];
}

function startVoiceEntry() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported.");
    const recognition = new SpeechRecognition();
    recognition.onresult = (e) => document.getElementById("journalText").value += e.results[0][0].transcript;
    recognition.start();
}
// --- DRAFT PERSISTENCE ---
// Saves the draft as the user types
document.getElementById("journalText").addEventListener("input", (e) => {
  if (!editingId) { 
      localStorage.setItem("journalDraft", e.target.value);
  }
});