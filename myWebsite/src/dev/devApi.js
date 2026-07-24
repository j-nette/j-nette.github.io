// Dev-only client for the authoring backend (see dev/authoring-plugin.js).
// All calls are no-ops in production because the edit UI that invokes them only
// renders under import.meta.env.DEV.

export const isDev = import.meta.env.DEV;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads a File to the correct media folder and returns the saved filename.
// folder: "project" | "daydream"
export async function uploadMedia(file, folder) {
  const dataBase64 = await fileToBase64(file);
  const res = await fetch("/api/upload-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, filename: file.name, dataBase64 }),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return data.filename;
}

async function save(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

export const saveProjects = (projects) =>
  save("/api/save-projects", { projects });
export const saveDaydreams = (daydreams) =>
  save("/api/save-daydreams", { daydreams });
export const saveExperiences = (experiences) =>
  save("/api/save-experiences", { experiences });
