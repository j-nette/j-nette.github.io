import { useRef, useState } from "react";
import { Plus, X, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadMedia } from "../dev/devApi";
import { Media, isVideoFile } from "./Media";

// Auto-growing inline text editor. Renders a textarea (multiline) or input.
export function EditableText({
  value,
  onChange,
  placeholder = "",
  multiline = false,
  className = "",
}) {
  if (multiline) {
    return (
      <textarea
        className={`edit-field edit-textarea ${className}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(2, String(value || "").split("\n").length)}
      />
    );
  }
  return (
    <input
      className={`edit-field edit-input ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// Editable list of chips (tags/technologies) with add + remove.
export function TagEditor({ tags = [], onChange, chipClassName = "" }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (v) onChange([...tags, v]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="tag-editor">
      {tags.map((tag, i) => (
        <span key={i} className={`tag-editor-chip ${chipClassName}`}>
          {tag}
          <button
            type="button"
            className="tag-editor-remove"
            onClick={() =>
              onChange(tags.filter((_, idx) => idx !== i))
            }
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          className="edit-field tag-editor-input"
          value={draft}
          autoFocus
          placeholder="new tag"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="tag-editor-add"
          onClick={() => setAdding(true)}
        >
          <Plus size={12} /> tag
        </button>
      )}
    </div>
  );
}

// Editable carousel/media list: add (upload), remove, reorder.
// folder: "project" | "daydream". resolver resolves filename -> url.
export function MediaEditor({ items = [], onChange, folder, resolver }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const names = [];
      for (const file of files) {
        const name = await uploadMedia(file, folder);
        names.push(name);
      }
      onChange([...items, ...names]);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  return (
    <div className="media-editor">
      <div className="media-editor-grid">
        {items.map((filename, i) => (
          <div key={`${filename}-${i}`} className="media-editor-item">
            <Media
              filename={filename}
              resolver={resolver}
              alt=""
              className="media-editor-thumb"
              controls={isVideoFile(filename)}
            />
            <div className="media-editor-controls">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move left"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(items.filter((_, idx) => idx !== i))
                }
                aria-label="Remove media"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                aria-label="Move right"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="media-editor-add"
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={busy}
        >
          <Plus size={20} />
          <span>{busy ? "Uploading…" : "Add media"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
