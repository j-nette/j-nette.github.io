// Dev-only Vite plugin that powers the in-browser authoring tool.
// It is active ONLY during `npm run dev` (configureServer) and is never part of
// the production build, so none of these write endpoints ship to visitors.
import fs from "node:fs";
import path from "node:path";

const ASSETS_DIR = path.resolve(process.cwd(), "src", "assets");
const PROJECT_PHOTOS = path.join(ASSETS_DIR, "projectPhotos");
const DAYDREAM_PHOTOS = path.join(ASSETS_DIR, "daydreamPhotos");

const PROJECTS_FILE = path.join(ASSETS_DIR, "projects.js");
const DAYDREAMS_FILE = path.join(ASSETS_DIR, "daydreams.js");
const EXPERIENCES_FILE = path.join(ASSETS_DIR, "experiences.js");

// ---- header blocks (must match the loaders the app already relies on) ----

const PROJECTS_HEADER = `const mediaModules = import.meta.glob(
  './projectPhotos/*.(png|jpg|jpeg|gif|svg|webp|PNG|JPG|JPEG|GIF|SVG|WEBP|mp4|webm|mov|MP4|WEBM|MOV)',
  { eager: true }
);

export const getMediaPath = (filename) => {
  if (!filename) return null;
  const key = \`./projectPhotos/\${filename}\`;
  return mediaModules[key]?.default || null;
};
`;

const DAYDREAMS_HEADER = `// Media loader for Daydreams blog photos/videos.
const mediaModules = import.meta.glob(
  "./daydreamPhotos/*.(png|jpg|jpeg|JPG|JPEG|gif|svg|webp|mp4|webm|mov)",
  { eager: true }
);

export const getDaydreamMedia = (filename) => {
  if (!filename) return null;
  const match = Object.entries(mediaModules).find(([path]) =>
    path.endsWith(\`/\${filename}\`)
  );
  return match ? match[1].default : null;
};
`;

// ---- helpers ----

function sanitizeFilename(name) {
  const base = path.basename(name || "upload");
  const ext = path.extname(base).toLowerCase();
  const stem = base
    .slice(0, base.length - ext.length)
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "media";
  return { stem, ext };
}

function uniquePath(dir, stem, ext) {
  let candidate = `${stem}${ext}`;
  let i = 1;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${i}${ext}`;
    i += 1;
  }
  return candidate;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      // guard against absurd payloads (~200MB)
      if (size > 200 * 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function writeGenerated(file, contents) {
  fs.writeFileSync(file, contents, "utf8");
}

// ---- codegen ----

function genProjects(projects) {
  return (
    PROJECTS_HEADER +
    `\nconst projects = ${JSON.stringify(projects, null, 2)};\n\nexport default projects;\n`
  );
}

function genDaydreams(daydreams) {
  return (
    DAYDREAMS_HEADER +
    `\nconst daydreams = ${JSON.stringify(daydreams, null, 2)};\n\nexport default daydreams;\n`
  );
}

function genExperiences(experiences) {
  return `export const experiences = ${JSON.stringify(experiences, null, 2)};\n`;
}

// ---- plugin ----

export default function authoringPlugin() {
  return {
    name: "vite-dev-authoring",
    apply: "serve",
    configureServer(server) {
      fs.mkdirSync(PROJECT_PHOTOS, { recursive: true });
      fs.mkdirSync(DAYDREAM_PHOTOS, { recursive: true });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        try {
          if (req.method === "POST" && req.url === "/api/upload-media") {
            const body = await readJsonBody(req);
            const { folder, filename, dataBase64 } = body;
            const dir = folder === "daydream" ? DAYDREAM_PHOTOS : PROJECT_PHOTOS;
            const { stem, ext } = sanitizeFilename(filename);
            const finalName = uniquePath(dir, stem, ext);
            const buffer = Buffer.from(dataBase64, "base64");
            fs.writeFileSync(path.join(dir, finalName), buffer);
            return sendJson(res, 200, { filename: finalName });
          }

          if (req.method === "POST" && req.url === "/api/save-projects") {
            const body = await readJsonBody(req);
            writeGenerated(PROJECTS_FILE, genProjects(body.projects || body));
            return sendJson(res, 200, { ok: true });
          }

          if (req.method === "POST" && req.url === "/api/save-daydreams") {
            const body = await readJsonBody(req);
            writeGenerated(DAYDREAMS_FILE, genDaydreams(body.daydreams || body));
            return sendJson(res, 200, { ok: true });
          }

          if (req.method === "POST" && req.url === "/api/save-experiences") {
            const body = await readJsonBody(req);
            writeGenerated(
              EXPERIENCES_FILE,
              genExperiences(body.experiences || body)
            );
            return sendJson(res, 200, { ok: true });
          }

          return next();
        } catch (err) {
          return sendJson(res, 500, { error: String(err && err.message || err) });
        }
      });
    },
  };
}
