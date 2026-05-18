const buttonsContainer = document.getElementById("buttons");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ff6b6b" : "#8be9fd";
}

function parseApiError(detail) {
  if (!detail) {
    return "Unknown error";
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (typeof detail === "object") {
    if (detail.stderr || detail.stdout || detail.returncode !== undefined) {
      const parts = [];
      if (detail.stderr) parts.push(`stderr: ${detail.stderr}`);
      if (detail.stdout) parts.push(`stdout: ${detail.stdout}`);
      if (detail.returncode !== undefined) parts.push(`returncode: ${detail.returncode}`);
      return parts.join(" | ");
    }
    return JSON.stringify(detail);
  }
  return String(detail);
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
    showMessage(`Running ${commandId}...`);
    const response = await fetch("/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command_id: commandId }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data ? parseApiError(data.detail) : `Request failed: ${response.status}`);
    }

    showMessage(`Executed: ${commandId} (${data?.stdout || "ok"})`);
  } catch (err) {
    showMessage(err.message, true);
  }
}

fetchCommands();
