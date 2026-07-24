import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { Plus, Trash2 } from 'lucide-react';
import { experiences as experiencesData } from '../assets/experiences';
import { EditableText } from '@authoring/controls';
import { saveExperiences } from '@authoring/api';

import profImage from '../assets/homeBG.png';

const About = () => {
  const [items, setItems] = useState(experiencesData);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Build-time gate: false literal in production; strips authoring UI + save calls.
  const authoring = import.meta.env.DEV;

  const setItem = (i, patch) => {
    setItems((list) => list.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
    setDirty(true);
  };
  const removeItem = (i) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    setItems((list) => list.filter((_, idx) => idx !== i));
    setDirty(true);
  };
  const addItem = () => {
    setItems((list) => [
      { title: "New Role", company: "", time: "", description: "" },
      ...list,
    ]);
    setDirty(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      await saveExperiences(items);
      setDirty(false);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="about-container">
      <aside className="about-sidebar">
        <div className="sidebar-content">
          <div className="profile-section">
            <div className="profile-image-wrapper">
              <div className="profile-image">
                <img 
                  src={profImage} 
                  alt="Have a cloudy sky I drew :)" 
                />
              </div>
            </div>
            <h1 className="profile-name">Jeanette Guo</h1>
            <p>Mechatronics Engineering @ UBC</p>
            <p>Schulich Leader Scholar</p>
          </div>

          <nav className="sidebar-nav">
            <Link to="/" className="sidebar-nav-link">Home</Link>
            <Link to="/portfolio" className="sidebar-nav-link">Portfolio</Link>
            <Link to="/daydreams" className="sidebar-nav-link">Daydreams</Link>
          </nav>
          
          <div className="sidebar-contact">
            <h2 className="sidebar-section-title">Contact</h2>

            <a href="https://linkedin.com/in/jeanette-guo" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div className="contact-icon-small">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <span>LinkedIn</span>
            </a>

            <a href="https://github.com/j-nette" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div className="contact-icon-small">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </div>
              <span>GitHub</span>
            </a>

            <a href="mailto:placeholder@email.com" className="contact-link">
              <div className="contact-icon-small">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-10 5L2 7"></path>
                </svg>
              </div>
              <span>placeholder@email.com</span>
            </a>

    
          </div>
        </div>
      </aside>

      {/* Left */}
      <main className="about-main">

        {/*Timeline */}
        <section className="experience-section">
          <h2 className="section-title">Experience</h2>

          {authoring && (
            <div className="dev-edit-bar">
              <button className="dev-edit-btn" onClick={addItem}>
                <Plus size={14} /> Add experience
              </button>
              <button
                className="dev-btn-save"
                onClick={save}
                disabled={saving || !dirty}
              >
                {saving ? "Saving…" : dirty ? "Save" : "Saved"}
              </button>
            </div>
          )}

          <div className="timeline">
            {items.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  {authoring ? (
                    <>
                      <EditableText
                        value={exp.time}
                        onChange={(v) => setItem(index, { time: v })}
                        placeholder="May 2026 - Jul 2026"
                        className="timeline-date"
                      />
                      <EditableText
                        value={exp.title}
                        onChange={(v) => setItem(index, { title: v })}
                        placeholder="Role / title"
                        className="timeline-role"
                      />
                      <EditableText
                        value={exp.company}
                        onChange={(v) => setItem(index, { company: v })}
                        placeholder="Company"
                        className="timeline-company"
                      />
                      <EditableText
                        value={exp.description}
                        onChange={(v) => setItem(index, { description: v })}
                        placeholder="Description"
                        multiline
                      />
                      <button
                        className="dev-btn-danger"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="timeline-date">{exp.time}</span>
                      <h3 className="timeline-role">{exp.title}</h3>
                      <h4 className="timeline-company">{exp.company}</h4>
                      <p className="description timeline-desc">{exp.description}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
