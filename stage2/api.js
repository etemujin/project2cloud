// One helper for every call to the backend.
// Usage: const data = await apiGet("/recipes", { page: 2, limit: 20 });

async function apiGet(path, params = {}) {
  const url = new URL(API_BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const started = performance.now();
  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error("Cannot reach the backend at " + API_BASE_URL + ". Is it running?");
  }
  const roundTripMs = Math.round(performance.now() - started);

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error("The backend sent an unreadable response (status " + response.status + ").");
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed with status " + response.status);
  }

  if (data.metadata && typeof data.metadata.execution_time_seconds === "number") {
    showExecutionTime(data.metadata.execution_time_seconds, roundTripMs);
  }

  return data;
}

function showExecutionTime(seconds, roundTripMs) {
  const functionMs = Math.round(seconds * 1000);
  document.getElementById("executionTime").textContent =
    "Execution time: " + functionMs + " ms (round trip " + roundTripMs + " ms)";
}