// Production stubs for the dev-only inline editors (src/components/EditControls.jsx).
// The real editors are aliased in only for the dev server (see vite.config.js);
// this file keeps their exports resolvable in a production build while shipping
// no editing UI, upload logic, or authoring dependencies. These render nothing
// because every call site is gated behind isDev (always false in production).

export function EditableText() {
  return null;
}

export function TagEditor() {
  return null;
}

export function MediaEditor() {
  return null;
}
