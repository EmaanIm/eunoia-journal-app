let currentPrompt = "";

function startEntry(promptText) {
  currentPrompt = promptText;
  document.getElementById("entryTitle").innerText = promptText;
  document.getElementById("journalText").value = "";
}

function saveEntry() {
  const text = document.getElementById("journalText").value;

  if (!text) {
    alert("Write something before saving.");
    return;
  }

  const entry = {
    prompt: currentPrompt,
    content: text,
    date: new Date().toLocaleString()
  };

  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.unshift(entry);

  localStorage.setItem("journalEntries", JSON.stringify(entries));

  displayEntries();
  document.getElementById("journalText").value = "";
}

function displayEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  const container = document.getElementById("entriesList");
  container.innerHTML = "";

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("entry-card");
    div.innerHTML = `
      <strong>${entry.prompt}</strong>
      <p>${entry.content}</p>
      <small>${entry.date}</small>
    `;
    container.appendChild(div);
  });
}

displayEntries();
