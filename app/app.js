const buttonsContainer = document.getElementById("buttons");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ff6b6b" : "#8be9fd";
}

async function fetchCommands() {
  try {
    const response = await fetch("/commands");
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const commands = await response.json();
    renderButtons(commands);
    showMessage("Buttons loaded.");
  } catch (err) {
    showMessage(err.message, true);
  }
}

function renderButtons(commands) {
  buttonsContainer.innerHTML = "";
  if (!Array.isArray(commands)) {
    showMessage("Invalid command response.", true);
    return;
  }

  commands.forEach((command) => {
    const btn = document.createElement("button");
    btn.textContent = command.label;
    btn.className = "command-button";
    btn.addEventListener("click", () => runCommand(command.id));
    buttonsContainer.appendChild(btn);
  });
}

async function runCommand(commandId) {
  try {
    const response = await fetch("/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command_id: commandId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || `${response.status}`);
    }
    const data = await response.json();
    showMessage(`Executed: ${commandId} (${data.stdout || "ok"})`);
  } catch (err) {
    showMessage(err.message, true);
  }
}

fetchCommands();
