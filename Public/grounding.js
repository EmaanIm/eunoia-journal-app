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
    
    inputStack.innerHTML = ""; // Clear the area

    // 1. Set the Instruction Text
    if (mode === 'quick') {
        instruction.innerHTML = `Quickly spot <span style="color:#6c7a89">${s.count}</span> thing(s) you can ${s.prompt}.`;
    } else {
        instruction.innerHTML = `Take a deep breath. Find <span style="color:#6c7a89">${s.count}</span> things to ${s.prompt}.`;
    }

    // 2. Handle Interaction (Inputs vs. No Inputs)
    if (typingPreference === 'text') {
        // Generate Input Boxes
        // In Quick Mode, we might only give 1 box even if the count is 5, 
        // but let's stick to the selected mode's count for consistency.
        const boxCount = s.count;
        
        for (let i = 0; i < boxCount; i++) {
            const input = document.createElement('input');
            input.className = "grounding-field";
            input.placeholder = `Item ${i+1}...`;
            inputStack.appendChild(input);
        }
    } else {
        // No Typing: Show the Scaffold Hint Box
        const scaffold = document.createElement('div');
        scaffold.className = "grounding-scaffold-box";
        scaffold.innerHTML = getScaffoldHint(s.prompt);
        inputStack.appendChild(scaffold);
    }
}

function getScaffoldHint(sense) {
    const hints = {
        "see": "Look for: Something <b>round</b>, something <b>blue</b>, or something <b>shiny</b>.",
        "touch": "Look for: Something <b>cold</b>, something <b>soft</b>, or the <b>weight</b> of your feet.",
        "hear": "Listen for: Something <b>constant</b> (hum), something <b>distant</b>, or your <b>breath</b>.",
        "smell": "Notice: The <b>air</b>, your <b>clothes</b>, or a <b>memory</b> of coffee.",
        "taste": "Notice: The <b>inside</b> of your mouth or a <b>sip</b> of water."
    };
    return `<p style="color: #7f8c8d; font-style: italic; background: #f9fbf9; padding: 15px; border-radius: 12px; border-left: 4px solid #9fb094; text-align: left;">${hints[sense]}</p>`;
}

function advance() {
    if(currentStep < 4) {
        currentStep++;
        updateStep();
    } else {
        alert("Well done. You are here.");
        location.reload();
    }
}