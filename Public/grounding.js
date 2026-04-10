let currentStep = 0;
let mode = 'deep';
let typingPreference = 'none'; // Default

const data = [
    { count: 5, prompt: "see" },
    { count: 4, prompt: "touch" },
    { count: 3, prompt: "hear" },
    { count: 2, prompt: "smell" },
    { count: 1, prompt: "taste" }
];

function startExercise(selectedMode) {
    mode = selectedMode;
    // Get the value from the radio buttons
    typingPreference = document.querySelector('input[name="typingPref"]:checked').value;
    
    document.getElementById('setupArea').style.display = 'none';
    document.getElementById('exerciseArea').style.display = 'block';
    updateStep();
}

function updateStep() {
    const s = data[currentStep];
    const instruction = document.getElementById('instruction');
    const inputStack = document.getElementById('inputStack');
    
    document.getElementById('stepNum').innerText = s.count;
    document.getElementById('pBar').style.width = ((currentStep + 1) / 5 * 100) + "%";
    
    inputStack.innerHTML = ""; 

    // 1. Set the Instruction Text
    instruction.innerHTML = mode === 'quick' 
        ? `Quickly spot <span style="color:#6c7a89">${s.count}</span> thing(s) you can ${s.prompt}.`
        : `Take a deep breath. Find <span style="color:#6c7a89">${s.count}</span> things to ${s.prompt}.`;

    // 2. Add the Neurodivergent Tools (Scrambler, Sounds, etc.)
    const toolDiv = document.createElement('div');
    toolDiv.className = "grounding-tool-container";
    toolDiv.innerHTML = getNeuroTools(s.prompt);
    inputStack.appendChild(toolDiv);

    // 3. Handle Interaction
    if (typingPreference === 'text') {
        for (let i = 0; i < s.count; i++) {
            const input = document.createElement('input');
            input.className = "grounding-field";
            input.placeholder = `Item ${i+1}...`;
            inputStack.appendChild(input);
        }
    } else {
        const scaffold = document.createElement('div');
        scaffold.className = "grounding-scaffold-box";
        scaffold.innerHTML = getScaffoldHint(s.prompt);
        inputStack.appendChild(scaffold);
    }
}

function getScaffoldHint(sense) {
    const hints = {
        "see": "Struggling to focus? Use the <b>Image Scrambler</b> or look for something square.",
        "touch": "Tactile check: Find something <b>cold</b>, something <b>fuzzy</b>, something <b>rough</b>, and something <b>smooth</b>.",
        "hear": "Is it too quiet? Use the <b>Ambient Toggle</b> or listen for the hum of electronics.",
        "smell": "Memory Anchor: Imagine the smell of <b>fresh rain</b>, a <b>peeled orange</b>, or <b>clean laundry</b>.",
        "taste": "Safe-Food Check: Take a <b>sip of water</b> or notice the lingering taste of your last meal."
    };
    return `<p class="hint-text">${hints[sense]}</p>`;
}

// Feature Logics
// --- AUDIO SETUP ---
// Using a direct, high-compatibility link
let rainAudio = new Audio('https://storage.googleapis.com/codeskulptor-assets/resources/t-rex/jump.ogg'); // Testing with a short system sound first to see if it triggers
// Once we confirm this works, you can swap it back to a long rain MP3.

function toggleAmbient(btn) {
    // 1. Force the audio to load
    rainAudio.load(); 
    
    if (rainAudio.paused) {
        // 2. Play with a catch-all for browser blocks
        let playPromise = rainAudio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                btn.innerText = "🔇 Stop Sound";
                btn.style.backgroundColor = "#9fb094"; 
                btn.style.color = "white";
            }).catch(error => {
                console.error("Playback failed:", error);
                alert("Browser blocked audio. Please click anywhere on the page first, then try the button.");
            });
        }
    } else {
        rainAudio.pause();
        btn.innerText = "🌧️ Play Sound";
        btn.style.backgroundColor = "#f8f9fa"; 
        btn.style.color = "#6c7a89";
    }
}

function getNeuroTools(sense) {
    switch(sense) {
        case 'see':
            return `<button class="tool-btn" onclick="runScrambler()">🖼️ Image Scrambler</button>`;
        case 'hear':
            return `<button class="tool-btn" onclick="toggleAmbient(this)">🌧️ Play Soft Rain</button>`;
        default:
            return "";
    }
}

function runScrambler() {
    const existingImg = document.querySelector('.scrambler-img');
    if (existingImg) existingImg.remove();

    const images = [
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500"
    ];
    
    const randomImg = images[Math.floor(Math.random() * images.length)];
    const container = document.getElementById('inputStack');
    
    const imgEl = document.createElement('img');
    imgEl.src = randomImg;
    imgEl.className = "scrambler-img"; 
    imgEl.style = "width:100%; max-width:400px; border-radius:15px; margin: 15px auto; display:block; box-shadow: 0 4px 15px rgba(0,0,0,0.1); animation: fadeIn 0.5s;";
    
    container.prepend(imgEl);
}

// THE FIX: Adding the missing advance function
function advance() {
    if(currentStep < 4) {
        currentStep++;
        updateStep();
    } else {
        alert("Well done. You are here.");
        location.reload();
    }
}