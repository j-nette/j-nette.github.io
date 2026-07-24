import { useState, useEffect, useRef } from "react";
import {
  X,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from "lucide-react";
import daydreamsData, { getDaydreamMedia } from "../assets/daydreams";
import { Media } from "../components/Media";
import { EditableText, TagEditor } from "../components/EditControls";
import { isDev, saveDaydreams, uploadMedia } from "../dev/devApi";
import cloudDefault from "../assets/homeBG.png";
import "../App.css";

// First image block's filename in a post body, or null.
function firstPostImage(post) {
  const block = post?.body?.find((b) => b.type === "image" && b.filename);
  return block ? block.filename : null;
}

// Estimated reading time derived from the post body's word count
// (~200 words per minute, minimum 1 minute).
function readingTime(post) {
  const words = (post?.body || [])
    .filter((b) => b.type === "text")
    .map((b) => b.value || "")
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

// Inline editor for a post's block-based body (text paragraphs + photos).
function BodyEditor({ body = [], onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const setBlock = (i, patch) =>
    onChange(body.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const removeBlock = (i) => {
    if (!window.confirm("Are you sure you want to delete this block?")) return;
    onChange(body.filter((_, idx) => idx !== i));
  };
  const move = (i, dir) => {
    const to = i + dir;
    if (to < 0 || to >= body.length) return;
    const next = [...body];
    const [it] = next.splice(i, 1);
    next.splice(to, 0, it);
    onChange(next);
  };
  const addText = () => onChange([...body, { type: "text", value: "" }]);

  const addPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const blocks = [];
      for (const file of files) {
        const name = await uploadMedia(file, "daydream");
        blocks.push({ type: "image", filename: name });
      }
      onChange([...body, ...blocks]);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="blog-body-editor">
      {body.map((block, i) => (
        <div key={i} className="blog-block">
          {block.type === "image" ? (
            <div className="blog-reader-image">
              <Media filename={block.filename} resolver={getDaydreamMedia} alt="" controls />
            </div>
          ) : (
            <EditableText
              value={block.value}
              onChange={(v) => setBlock(i, { value: v })}
              placeholder="Write freely…"
              multiline
            />
          )}
          <div className="blog-block-controls">
            <button className="dev-btn-cancel" onClick={() => move(i, -1)} disabled={i === 0}>
              <ArrowUp size={14} />
            </button>
            <button
              className="dev-btn-cancel"
              onClick={() => move(i, 1)}
              disabled={i === body.length - 1}
            >
              <ArrowDown size={14} />
            </button>
            <button className="dev-btn-danger" onClick={() => removeBlock(i)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <div className="blog-block-add-row">
        <button className="dev-edit-btn" onClick={addText}>
          <Plus size={14} /> Paragraph
        </button>
        <button
          className="dev-edit-btn"
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={busy}
        >
          <ImageIcon size={14} /> {busy ? "Uploading…" : "Photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addPhotos(e.target.files)}
        />
      </div>
    </div>
  );
}

function DaydreamReader({
  post,
  onClose,
  canEdit = false,
  onSave,
  onDelete,
  startInEdit = false,
}) {
  const [editing, setEditing] = useState(startInEdit);
  const [draft, setDraft] = useState(post);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(post);
  }, [post]);

  if (!post) return null;

  const view = editing ? draft : post;
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(post);
    setEditing(false);
    if (startInEdit) onClose();
  };

  return (
    <div className="project-card-overlay" onClick={onClose}>
      <div className="project-card-container blog-reader" onClick={(e) => e.stopPropagation()}>
        {canEdit && (
          <div className="dev-edit-bar">
            {editing ? (
              <>
                <button className="dev-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="dev-btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="dev-edit-btn" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="dev-btn-danger"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this post?")) onDelete(post.id);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}

        <div className="project-card-header">
          <div className="project-card-header-top">
            {editing ? (
              <EditableText
                value={view.title}
                onChange={(v) => setField("title", v)}
                placeholder="Post title"
                className="project-card-title"
              />
            ) : (
              <h1 className="project-card-title">{view.title}</h1>
            )}
            <button onClick={onClose} className="project-card-close-btn">
              <X size={24} />
            </button>
          </div>

          {editing ? (
            <div className="dev-edit-bar">
              <EditableText
                value={view.date}
                onChange={(v) => setField("date", v)}
                placeholder="Date (e.g. Jul 2026)"
              />
            </div>
          ) : (
            <p className="description project-card-subtitle">
              {view.date} · {readingTime(view)}
            </p>
          )}

          {editing ? (
            <div className="project-card-tags">
              <TagEditor
                tags={view.tags || []}
                onChange={(v) => setField("tags", v)}
                chipClassName="project-card-tag"
              />
            </div>
          ) : (
            view.tags &&
            view.tags.length > 0 && (
              <div className="project-card-tags">
                {view.tags.map((tag, index) => (
                  <span key={index} className="project-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )
          )}
        </div>

        <div className="project-card-content">
          {editing && (
            <div className="project-card-description">
              <label className="dev-status">Excerpt (preview text)</label>
              <EditableText
                value={view.excerpt}
                onChange={(v) => setField("excerpt", v)}
                placeholder="Short excerpt shown in the list/feature"
                multiline
              />
            </div>
          )}

          {editing ? (
            <BodyEditor
              body={view.body || []}
              onChange={(v) => setField("body", v)}
            />
          ) : (
            (view.body || []).map((block, index) =>
              block.type === "image" ? (
                <div key={index} className="blog-reader-image">
                  <Media
                    filename={block.filename}
                    resolver={getDaydreamMedia}
                    alt=""
                    controls
                  />
                </div>
              ) : (
                <div key={index} className="project-card-description">
                  <p>{block.value}</p>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Daydreams() {
  const [items, setItems] = useState(daydreamsData);
  const [draftPost, setDraftPost] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const selectedPost =
    draftPost && draftPost.id === selectedPostId
      ? draftPost
      : items.find((post) => post.id === selectedPostId) || null;

  // ---- Search ----
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const normalizedQuery = searchQuery.toLowerCase().trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Hide the page scrollbar while on Daydreams (scrolling still works).
  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    return () => document.documentElement.classList.remove("hide-scrollbar");
  }, []);

  const postText = (post) =>
    (post.body || [])
      .filter((b) => b.type === "text")
      .map((b) => b.value || "")
      .join(" ");

  const postMatches = (post) => {
    if (!normalizedQuery) return true;
    const haystack = [
      post.title,
      post.excerpt,
      postText(post),
      ...(post.tags || []),
    ];
    return haystack.some((v) => v?.toLowerCase().includes(normalizedQuery));
  };

  const suggestions = (() => {
    const index = new Map();
    const add = (term, type) => {
      if (!term) return;
      const key = term.toLowerCase();
      const existing = index.get(key);
      if (existing) existing.count += 1;
      else index.set(key, { term, type, count: 1 });
    };
    items.forEach((post) => {
      add(post.title, "Post");
      post.tags?.forEach((tag) => add(tag, "Tag"));
    });
    const all = Array.from(index.values());

    if (!normalizedQuery) {
      return [...all]
        .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
        .slice(0, 5);
    }
    return all
      .filter((e) => e.term.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = a.term.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.term.toLowerCase().startsWith(normalizedQuery);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return b.count - a.count || a.term.localeCompare(b.term);
      })
      .slice(0, 5);
  })();

  const visiblePosts = items.filter(postMatches);
  const [featured, ...rest] = visiblePosts;

  // Use the post's first photo when it has one, otherwise fall back to the clouds.
  const featuredImageFile = firstPostImage(featured);
  const featuredImage =
    (featuredImageFile && getDaydreamMedia(featuredImageFile)) || cloudDefault;

  const persist = async (list) => {
    setItems(list);
    if (isDev) {
      try {
        await saveDaydreams(list);
      } catch (err) {
        alert(`Could not save posts to source: ${err.message}`);
      }
    }
  };

  const handleSavePost = async (updated) => {
    const exists = items.some((p) => p.id === updated.id);
    const list = exists
      ? items.map((p) => (p.id === updated.id ? updated : p))
      : [updated, ...items];
    await persist(list);
    setDraftPost(null);
  };

  const handleDeletePost = async (id) => {
    await persist(items.filter((p) => p.id !== id));
    setDraftPost(null);
    setSelectedPostId(null);
  };

  const handleAddPost = () => {
    const id = `post-${Date.now()}`;
    setDraftPost({
      id,
      title: "New Daydream",
      date: "",
      tags: [],
      excerpt: "",
      body: [{ type: "text", value: "" }],
    });
    setSelectedPostId(id);
  };

  const handleClose = () => {
    setSelectedPostId(null);
    setDraftPost(null);
  };

  return (
    <>
      <div className="blog-header">
        <div className="blog-header-text">
          <h1 className="blog-title">Daydreams</h1>
          <p className="description blog-subtitle">
            A little corner for my thoughts, musings, and half-baked ideas.
          </p>
          {isDev && (
            <button className="dev-edit-btn blog-new-post" onClick={handleAddPost}>
              <Plus size={14} /> New post
            </button>
          )}
        </div>

        {/* Search */}
        <div
          className={`graph-search ${isFocused ? "active" : ""}`}
          ref={searchRef}
        >
          <input
            type="text"
            placeholder="Search daydreams, tags, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />

          {isFocused && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchQuery(suggestion.term);
                    setIsFocused(false);
                  }}
                >
                  <span className="suggestion-term">{suggestion.term}</span>
                  <span className="suggestion-type">{suggestion.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="blog-container">
        {visiblePosts.length === 0 && (
          <p className="description blog-empty">
            No daydreams match &ldquo;{searchQuery}&rdquo;.
          </p>
        )}

        {/* Featured / latest post */}
        {featured && (
          <article
            className="blog-featured"
            onClick={() => setSelectedPostId(featured.id)}
          >
            {featuredImage && (
              <div className="blog-featured-image">
                <img src={featuredImage} alt={featured.title} />
              </div>
            )}
            <div className="blog-featured-body">
              <span className="blog-eyebrow">Latest</span>
              <div className="blog-post-meta">
                <span>{featured.date}</span>
                <span className="blog-post-dot">·</span>
                <span>{readingTime(featured)}</span>
              </div>
              <h2 className="blog-featured-title">{featured.title}</h2>
              <p className="blog-featured-excerpt">{featured.excerpt}</p>
              {featured.tags && featured.tags.length > 0 && (
                <div className="blog-tags">
                  {featured.tags.map((tag, index) => (
                    <span key={index} className="blog-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="blog-read-more">
                Read more <ArrowRight size={16} />
              </span>
            </div>
          </article>
        )}

        {/* Minimal list of the rest */}
        {rest.length > 0 && (
          <div className="blog-list">
            {rest.map((post) => (
              <article
                key={post.id}
                className="blog-list-item"
                onClick={() => setSelectedPostId(post.id)}
              >
                <div className="blog-list-date">
                  <span>{post.date}</span>
                  <span className="blog-list-readtime">{readingTime(post)}</span>
                </div>
                <div className="blog-list-main">
                  <h3 className="blog-list-title">{post.title}</h3>
                  <p className="blog-list-excerpt">{post.excerpt}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="blog-list-arrow" size={18} />
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <DaydreamReader
          post={selectedPost}
          onClose={handleClose}
          canEdit={isDev}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
          startInEdit={!!draftPost && draftPost.id === selectedPostId}
        />
      )}
    </>
  );
}

export default Daydreams;
