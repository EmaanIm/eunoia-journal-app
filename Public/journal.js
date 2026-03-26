let currentPrompt = "Free Write";
const energyMeter = document.getElementById('energyMeter');
const energyValue = document.getElementById('energyValue');

// --- INITIALIZATION ---
window.onload = () => {
    displayEntries();
    if (energyMeter) {
        energyMeter.addEventListener('input', updateSliderFill);
        updateSliderFill(); 
    }
};

// --- CORE JOURNAL FUNCTIONS ---
function startEntry(promptText) {
    currentPrompt = promptText;
    document.getElementById("entryTitle").innerText = promptText;
    document.getElementById("journalText").focus();
}

function saveEntry() {
    const text = document.getElementById("journalText").value.trim();
    if (!text) return alert("Please write something first.");

    const entry = {
        id: Date.now(),
        prompt: currentPrompt,
        content: text,
        energy: energyMeter.value,
        date: new Date().toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    entries.unshift(entry);
    localStorage.setItem("journalEntries", JSON.stringify(entries));
    
    document.getElementById("journalText").value = "";
    displayEntries();
}

function displayEntries() {
    const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const container = document.getElementById("entriesList");
    container.innerHTML = "";

    entries.forEach(entry => {
        const div = document.createElement("div");
        div.className = "entry-card";
        div.innerHTML = `
            <div class="entry-header">
                <strong>${entry.prompt}</strong>
                <span class="energy-badge">⚡ ${entry.energy}/10</span>
            </div>
            <p>${entry.content}</p>
            <div class="entry-footer">
                <small>${entry.date}</small>
                <button class="del-btn" onclick="deleteEntry(${entry.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteEntry(id) {
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