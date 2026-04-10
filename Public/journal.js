let currentPrompt = "Free Write";
let editingId = null; 
const energyMeter = document.getElementById('energyMeter');
const energyValue = document.getElementById('energyValue');

// --- INITIALIZATION ---
window.onload = () => {
    displayEntries();
    
    const savedDraft = localStorage.getItem("journalDraft");
    if (savedDraft && document.getElementById("journalText")) {
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
    editingId = null;
    document.getElementById("entryTitle").innerText = promptText;
    const textArea = document.getElementById("journalText");
    textArea.value = "";
    textArea.focus();
}

function saveEntry() {
    const text = document.getElementById("journalText").value.trim();
    if (!text) return alert("Please write something first.");

    let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];

    if (editingId) {
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            entries[index].content = text;
            entries[index].energy = energyMeter.value;
            entries[index].date += " (edited)"; 
        }
        editingId = null;
    } else {
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
    localStorage.removeItem("journalDraft"); // Clear draft on save
    
    document.getElementById("journalText").value = "";
    document.getElementById("entryTitle").innerText = "Free Write";
    displayEntries();
}

function displayEntries() {
    const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const container = document.getElementById("entriesList");
    if (!container) return;
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
                    <button class="edit-btn" onclick="editEntry(${entry.id})" style="background:none; border:none; cursor:pointer; color:#6c7a89;">
                        Edit
                    </button>
                    <button class="del-btn" onclick="deleteEntry(${entry.id})" style="background:none; border:none; cursor:pointer; color:red;">
                        Delete
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

function editEntry(id) {
    const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const entryToEdit = entries.find(e => e.id === id);

    if (entryToEdit) {
        editingId = id;
        currentPrompt = entryToEdit.prompt;
        document.getElementById("entryTitle").innerText = `Editing: ${entryToEdit.prompt}`;
        document.getElementById("journalText").value = entryToEdit.content;
        energyMeter.value = entryToEdit.energy;
        updateSliderFill();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateSliderFill() {
    if (!energyMeter) return;
    const val = energyMeter.value;
    const percentage = (val - 1) * 100 / (10 - 1);
    energyMeter.style.background = `linear-gradient(to right, #a5b3a0 ${percentage}%, #f2f2f2 ${percentage}%)`;
    energyValue.innerText = `${val}/10`;
}

// --- TOOLKIT LOGIC ---
function closeAllOverlays() {
    const overlays = ['groundingOverlay', 'bodyScanOverlay', 'reframerOverlay', 'sensoryOverlay'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    const mainCard = document.getElementById("mainEntryCard");
    if (mainCard) mainCard.style.opacity = "1";
}

// 1. GROUNDING LOGIC
let miniStep = 0;
const groundingData = [
    { step: "5 - See", desc: "Look around. Name 5 things you can see." },
    { step: "4 - Touch", desc: "Reach out. Name 4 things you can feel." },
    { step: "3 - Hear", desc: "Listen close. Name 3 things you can hear." },
    { step: "2 - Smell", desc: "Breathe in. Name 2 things you can smell." },
    { step: "1 - Taste", desc: "Focus. Name 1 thing you can taste." }
];

function toggleGrounding() {
    const overlay = document.getElementById('groundingOverlay');
    if (overlay.style.display === 'none' || overlay.style.display === '') {
        closeAllOverlays();
        overlay.style.display = 'block';
        document.getElementById('groundingChoiceMenu').style.display = 'block';
        document.getElementById('miniGroundingSteps').style.display = 'none';
        document.getElementById("mainEntryCard").style.opacity = "0.2";
    } else {
        closeAllOverlays();
    }
}

function startMiniGrounding() {
    document.getElementById('groundingChoiceMenu').style.display = 'none';
    document.getElementById('miniGroundingSteps').style.display = 'block';
    miniStep = 0;
    updateMiniStep();
}

function updateMiniStep() {
    const data = groundingData[miniStep];
    document.getElementById('groundingStep').innerText = data.step;
    document.getElementById('groundingDesc').innerText = data.desc;
}

function nextGroundingStep() {
    if (miniStep < 4) {
        miniStep++;
        updateMiniStep();
    } else {
        document.getElementById('groundingStep').innerText = "Centered.";
        document.getElementById('groundingDesc').innerText = "You've successfully grounded yourself.";
        setTimeout(() => {
            closeAllOverlays();
            startEntry("Post-Grounding Reflection");
            document.getElementById("journalText").value = "I have completed my grounding. Right now, I feel... ";
        }, 2000);
    }
}

// 2. BODY SCAN
function toggleBodyScan() {
    const el = document.getElementById("bodyScanOverlay");
    if (el.style.display === "none") {
        closeAllOverlays();
        el.style.display = "block";
        document.getElementById("mainEntryCard").style.opacity = "0.2";
    } else {
        closeAllOverlays();
    }
}

function logBodyPart(part) {
    closeAllOverlays();
    const textArea = document.getElementById("journalText");
    
    // Define area-specific release exercises
    const exercises = {
        'Head': 'Try a "Jaw Drop": Let your mouth hang open slightly and move your jaw side to side, or gently massage your temples.',
        'Shoulders': 'Try "Shoulder Shrugs": Inhale deeply while pulling shoulders to ears, hold for 3 seconds, and drop them heavily on the exhale.',
        'Chest': 'Try "Box Breathing": Inhale for 4, hold for 4, exhale for 4, hold for 4. Feel your ribs expand and contract.',
        'Stomach': 'Try "Abdominal Softening": Place a hand on your belly. Imagine the muscles melting like butter under a warm sun.',
        'Hands': 'Try "Clench and Release": Make a tight fist for 5 seconds, then splay your fingers out as wide as possible.',
        'Feet': 'Try "Ground Pressing": Push your big toes into the floor as hard as you can, hold, and then let the tension drain into the earth.'
    };

    // Use existing startEntry logic to create a structured workbook
    startEntry(`Body Scan: Tension in ${part}`);
    
    textArea.value = `[SENSATION CHECK]
I am feeling tension in my: ${part}
What does it feel like? (Sharp, heavy, buzzing, tight?): 
Does this tension remind me of a specific stressor or event?: 

[RELEASE EXERCISE]
${exercises[part] || 'Take 3 deep breaths, sending the air toward that part of your body.'}

[REFLECTION]
How does that area feel after the exercise?: `;

    textArea.focus();
}

// 3. THOUGHT REFRAMER (FIXED)
function toggleReframer() {
    const el = document.getElementById("reframerOverlay");
    if (el.style.display === "none") {
        closeAllOverlays();
        el.style.display = "block";
        document.getElementById("mainEntryCard").style.opacity = "0.2";
    } else {
        closeAllOverlays();
    }
}

function reframe(type) {
    closeAllOverlays();
    const textArea = document.getElementById("journalText");

    if (type === 'Fact') {
        startEntry("Reframing: Analyzing the Fact");
        textArea.value = "OBJECTIVE FACT CHECK\nThe situation is: \nIs this within my control? \nWhat is one small step I can take regarding this? \nHow can I accept this fact without judging myself?";
    } else {
        startEntry("Reframing: Validating the Feeling");
        textArea.value = "EMOTIONAL VALIDATION\n I am feeling: \n Why does this feeling make sense right now? \nWhat is this feeling trying to tell me? \nWhat do I need right now to feel supported?";
    }
    textArea.focus();
}

// 4. SENSORY RESET
function toggleSensory() {
    const el = document.getElementById("sensoryOverlay");
    if (el.style.display === "none") {
        closeAllOverlays();
        el.style.display = "block";
        document.getElementById("mainEntryCard").style.opacity = "0.2";
        nextSensory();
    } else {
        closeAllOverlays();
    }
}

function nextSensory() {
    const tasks = ["Splash cold water on your face.", "Hold an ice cube.", "Push against a wall.", "Hum a low note."];
    document.getElementById("sensoryTask").innerText = tasks[Math.floor(Math.random() * tasks.length)];
}

// 5. VOICE TO TEXT
function startVoiceEntry() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported.");
    const recognition = new SpeechRecognition();
    recognition.onresult = (e) => document.getElementById("journalText").value += e.results[0][0].transcript;
    recognition.start();
}