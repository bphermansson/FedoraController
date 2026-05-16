const serverUrlInput = document.getElementById("serverUrl");
const apiTokenInput = document.getElementById("apiToken");
const fetchBtn = document.getElementById("fetchBtn");
const buttonsContainer = document.getElementById("buttons");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ff6b6b" : "#8be9fd";
}

async function fetchCommands() {
  const serverUrl = serverUrlInput.value.trim();
  const apiToken = apiTokenInput.value.trim();
  if (!serverUrl || !apiToken) {
    showMessage("Enter both server URL and API token.", true);
    return;
  }

  try {
    const response = await fetch(`${serverUrl.replace(/\/$/, "")}/commands`, {
      headers: { "x-api-token": apiToken },
    });
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
  const serverUrl = serverUrlInput.value.trim();
  const apiToken = apiTokenInput.value.trim();
  try {
    const response = await fetch(`${serverUrl.replace(/\/$/, "")}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
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

fetchBtn.addEventListener("click", fetchCommands);
