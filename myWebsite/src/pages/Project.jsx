import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Media, isVideoFile } from '../components/Media';
import { getMediaPath } from '../assets/projects';
import { EditableText, TagEditor, MediaEditor } from '@authoring/controls';
import '../App.css';

export default function ProjectCard({
  project,
  onClose,
  onSave,
  onDelete,
  canEdit = false,
  startInEdit = false,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingState, setEditing] = useState(startInEdit);
  const [draft, setDraft] = useState(project);
  const [saving, setSaving] = useState(false);

  // Build-time gate: import.meta.env.DEV is replaced with a literal false in
  // production, so every editor branch below is eliminated from the bundle.
  const authoring = import.meta.env.DEV;
  const editing = authoring && editingState;

  useEffect(() => {
    setDraft(project);
  }, [project]);

  if (!project) return null;

  const view = editing ? draft : project;
  const images = view.images || [];

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setLink = (key, value) =>
    setDraft((d) => ({ ...d, links: { ...(d.links || {}), [key]: value } }));

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

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
    setDraft(project);
    setEditing(false);
    if (startInEdit) onClose();
  };

  const safeIndex = Math.min(currentImageIndex, Math.max(0, images.length - 1));

  return (
    <div className="project-card-overlay" onClick={onClose}>
      <div className="project-card-container" onClick={(e) => e.stopPropagation()}>
        {authoring && canEdit && (
          <div className="dev-edit-bar">
            {editing ? (
              <>
                <button
                  className="dev-btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
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
                    if (window.confirm("Are you sure you want to delete this project?")) onDelete(project.id);
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
                placeholder="Project title"
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
            <EditableText
              value={view.subtitle}
              onChange={(v) => setField("subtitle", v)}
              placeholder="Subtitle"
              className="project-card-subtitle"
            />
          ) : (
            view.subtitle && (
              <p className="description project-card-subtitle">{view.subtitle}</p>
            )
          )}

          {/* Tags */}
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

          {/* Technologies */}
          {editing ? (
            <div className="project-card-technologies">
              <TagEditor
                tags={view.technologies || []}
                onChange={(v) => setField("technologies", v)}
                chipClassName="project-card-tech"
              />
            </div>
          ) : (
            view.technologies &&
            view.technologies.length > 0 && (
              <div className="project-card-technologies">
                {view.technologies.map((tech, index) => (
                  <span key={index} className="project-card-tech">
                    {tech}
                  </span>
                ))}
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="project-card-content">
          {/* Description 1 */}
          {editing ? (
            <div className="project-card-description">
              <EditableText
                value={view.description1}
                onChange={(v) => setField("description1", v)}
                placeholder="First description paragraph"
                multiline
              />
            </div>
          ) : (
            view.description1 && (
              <div className="project-card-description">
                <p>{view.description1}</p>
              </div>
            )
          )}

          {/* Carousel media editor (edit mode) */}
          {editing && (
            <MediaEditor
              items={images}
              onChange={(v) => setField("images", v)}
              folder="project"
              resolver={getMediaPath}
            />
          )}

          {/* Image/Video Carousel - only show if media exist */}
          {!editing && images.length > 0 && (
            <div className="project-card-carousel">
              <div className="project-card-carousel-inner">
                <Media
                  filename={images[safeIndex]}
                  alt={`${view.title} media ${safeIndex + 1}`}
                  className="project-card-carousel-image"
                  controls={isVideoFile(images[safeIndex])}
                />

                {/* Carousel Controls - only show if more than one item */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="project-card-carousel-btn project-card-carousel-btn-prev">
                      <ChevronLeft size={30} />
                    </button>
                    <button onClick={nextImage} className="project-card-carousel-btn project-card-carousel-btn-next">
                      <ChevronRight size={30} />
                    </button>

                    {/* dots */}
                    <div className="project-card-carousel-dots">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`project-card-carousel-dot ${
                            index === safeIndex ? 'active' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {editing ? (
            <div className="project-card-description">
              <EditableText
                value={view.description2}
                onChange={(v) => setField("description2", v)}
                placeholder="Second description paragraph"
                multiline
              />
            </div>
          ) : (
            view.description2 && (
              <div className="project-card-description">
                <p>{view.description2}</p>
              </div>
            )
          )}

          {/* Links */}
          {editing ? (
            <div className="project-card-links-edit">
              <label className="dev-status">GitHub link</label>
              <EditableText
                value={view.links?.github || ""}
                onChange={(v) => setLink("github", v)}
                placeholder="https://github.com/..."
              />
              <label className="dev-status">Other link</label>
              <EditableText
                value={view.links?.linkother || ""}
                onChange={(v) => setLink("linkother", v)}
                placeholder="https://..."
              />
            </div>
          ) : (
            view.links &&
            (view.links.github || view.links.linkother) && (
              <div className="project-card-links">
                {view.links.github && (
                  <a
                    href={view.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {view.links.linkother && (
                  <a
                    href={view.links.linkother}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Other Link
                  </a>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
