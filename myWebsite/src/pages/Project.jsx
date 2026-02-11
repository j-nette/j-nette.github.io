import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsData from '../assets/projects.js';
import '../App.css';

export default function ProjectCard({ projectId, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Convert projects array to object format keyed by id
  const projects = Array.isArray(projectsData) 
    ? projectsData.reduce((acc, project) => {
        acc[project.id] = project;
        return acc;
      }, {})
    : projectsData;

  // Get project data from projects object
  const project = projects[projectId];

  // If project doesn't exist, return null
  if (!project) {
    console.error(`Project with id "${projectId}" not found`);
    return null;
  }

  const nextImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  return (
    <div className="project-card-overlay" onClick={onClose}>
      <div className="project-card-container" onClick={(e) => e.stopPropagation()}>
        <div className="project-card-header">
          <div className="project-card-header-top">
            <h1 className="project-card-title">{project.title}</h1>
            <button onClick={onClose} className="project-card-close-btn">
                <X size={24} />
            </button>
            </div>
            {project.subtitle && (
            <p className="description project-card-subtitle">{project.subtitle}</p>
)}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="project-card-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="project-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="project-card-technologies">
              {project.technologies.map((tech, index) => (
                <span key={index} className="project-card-tech">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="project-card-content">
          {/* Description 1 */}
          {project.description1 && (
            <div className="project-card-description">
              <p>{project.description1}</p>
            </div>
          )}

          {/* Image Carousel - only show if images exist */}
          {project.images && project.images.length > 0 && (
            <div className="project-card-carousel">
              <div className="project-card-carousel-inner">
                <img
                  src={project.images[currentImageIndex]}
                  alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                  className="project-card-carousel-image"
                />
                
                {/* Carousel Controls - only show if more than one image */}
                {project.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="project-card-carousel-btn project-card-carousel-btn-prev">
                      <ChevronLeft size={30} />
                    </button>
                    <button onClick={nextImage} className="project-card-carousel-btn project-card-carousel-btn-next">
                      <ChevronRight size={30} />
                    </button>

                    {/* dots */}
                    <div className="project-card-carousel-dots">
                      {project.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`project-card-carousel-dot ${
                            index === currentImageIndex ? 'active' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {project.description2 && (
            <div className="project-card-description">
              <p>{project.description2}</p>
            </div>
          )}

          {/* Links */}
          {project.links && Object.keys(project.links).length > 0 && (
            <div className="project-card-links">
              {project.links.github && (
                <a 
                  href={project.links.github} 
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
              {project.links.linkother && (
                <a 
                  href={project.links.linkother} 
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
          )}
        </div>
      </div>
    </div>
  );
}