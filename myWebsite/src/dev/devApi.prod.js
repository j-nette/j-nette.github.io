// Production stub for the dev authoring client (src/dev/devApi.js).
// The real module is swapped in only for the dev server via a Vite alias
// (see vite.config.js). In a production build none of the authoring network
// code ships: isDev is a hard false and every writer is an inert no-op.

export const isDev = false;

export async function uploadMedia() {
  return "";
}

export async function saveProjects() {}
export async function saveDaydreams() {}
export async function saveExperiences() {}
