// Runs when the page opens, and (in later steps) wires up the buttons.

async function checkBackend() {
  const status = document.getElementById("connectionStatus");
  try {
    const data = await apiGet("/health");
    status.textContent = "Backend: " + data.status;
    status.className = "badge badge-ok";
  } catch (error) {
    status.textContent = "Backend: offline";
    status.className = "badge badge-error";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", checkBackend);