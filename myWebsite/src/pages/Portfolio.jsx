import { useMemo, useState, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import projects from "../assets/projects";
import "../App.css";
import ProjectCard from "./Project";

import peekImage from '../assets/peek.png';


function Portfolio() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const searchRef = useRef(null);
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const fgRef = useRef();

  // mobile/desktop resize?
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  // close search with esc need to implement click outside... it's not working
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

   

  //search
  const allSearchTerms = useMemo(() => {
    const terms = new Set();

    projects.forEach((project) => {
      terms.add(project.title);

      project.tags?.forEach((tag) => terms.add(tag));
      project.technologies?.forEach((tech) => terms.add(tech));
    });

    return Array.from(terms);
  }, []);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return allSearchTerms.slice(0, 3);
    }

    return allSearchTerms
      .filter((term) =>
        term.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 3);
  }, [normalizedQuery, allSearchTerms]);

  // graph
  const graphData = useMemo(() => {
    const nodes = projects.map((project) => ({
      id: project.id,
      title: project.title,
      tags: project.tags,
      technologies: project.technologies
    }));

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1Tags = nodes[i].tags || [];
        const node2Tags = nodes[j].tags || [];
        
        const hasSharedTag = node1Tags.some(tag => node2Tags.includes(tag));
        
        if (hasSharedTag) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id
          });
        }
      }
    }

    return { nodes, links };
  }, []);

  const nodeMatchesSearch = (node) => {
    if (!normalizedQuery) return true;

    const titleMatch = node.title
      .toLowerCase()
      .includes(normalizedQuery);

    const tagMatch = node.tags?.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );

    const techMatch = node.technologies?.some((tech) =>
      tech.toLowerCase().includes(normalizedQuery)
    );

    return titleMatch || tagMatch || techMatch;
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (!normalizedQuery) return true;

      const titleMatch = project.title
        .toLowerCase()
        .includes(normalizedQuery);

      const tagMatch = project.tags?.some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      );

      const techMatch = project.technologies?.some((tech) =>
        tech.toLowerCase().includes(normalizedQuery)
      );

      return titleMatch || tagMatch || techMatch;
    });
  }, [normalizedQuery]);

  const handleNodeClick = (node) => {
    setSelectedProjectId(node.id);
  };

  const handleCloseCard = () => {
    setSelectedProjectId(null);
  };


  return (
    <>
      <div className="portfolio-header">
        <div className="portfolio-header-text">
          <h1 className="portfolio-title">My Little Creations</h1>
          <p className="description portfolio-subtitle">
            Hover over a dot to preview and tap it to learn more.
          </p>
        </div>
        <div className= "peek-section">
            <div className="peek-image">
                <img 
                src={peekImage} 
                alt="Peek-a-boo!" 
                />
            </div>
        </div>

        {/*Search*/}
        <div
          className={`graph-search ${isFocused ? "active" : ""}`}
          ref={searchRef}
        >
          <input
            type="text"
            placeholder="Search projects, skills, etc..."
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
                    setSearchQuery(suggestion);
                    setIsFocused(false);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/*reponsiveness*/}
      {isMobile ? (
        <div className="mobile-grid-container">
          <div className="mobile-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="mobile-mini-card"
                onClick={() => setSelectedProjectId(project.id)}
              >
                {project?.images?.[0] && (
                  <img 
                    src={project.images[0]} 
                    alt={project.title}
                    className="mobile-mini-card-image"
                  />
                )}
                <div className="mobile-mini-card-content">
                  <h4>{project.title}</h4>
                  <p>{project.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="graph-container">
          <ForceGraph2D
            ref={fgRef}
            width={window.innerWidth}
            height={window.innerHeight * 0.75}
            graphData={graphData}
            //backgroundColor="#ffffff"
            nodeRelSize={3}
            linkWidth={3}
            

            onNodeDragEnd={(node) => {
              node.fx = undefined;
              node.fy = undefined;
            }}

            //wip make card appear on top of node?
            onNodeHover={(node) => {
              setHoveredNode(node || null);
            }}
            
            onNodeClick={handleNodeClick}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.2}
            cooldownTicks={100}
            
            d3Force={{
              charge: { strength: -150, distanceMax: 250 },
              link: { distance: 80, strength: 0.7 },
              center: { strength: 0.8 },
              collide: { radius: 40, strength: 0.9 },
              
              linkRepulsion: () => {
                const linkRepelStrength = 25;
                const linkRepelDistance = 20;
                
                return (alpha) => {
                  graphData.links.forEach(link => {
                    const source = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
                    const target = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
                    
                    if (!source || !target) return;
                    
                    graphData.nodes.forEach(node => {
                      // link magic
                      if (node.id === source.id || node.id === target.id) return;
                      
                      const dx = target.x - source.x;
                      const dy = target.y - source.y;
                      const lengthSq = dx * dx + dy * dy;
                      
                      if (lengthSq === 0) return;
                      
                      let t = ((node.x - source.x) * dx + (node.y - source.y) * dy) / lengthSq;
                      t = Math.max(0, Math.min(1, t));
                      
                      const closestX = source.x + t * dx;
                      const closestY = source.y + t * dy;
                      
                      const distX = node.x - closestX;
                      const distY = node.y - closestY;
                      const distance = Math.sqrt(distX * distX + distY * distY);
                      
                      if (distance < linkRepelDistance && distance > 0) {
                        const force = (linkRepelDistance - distance) / distance * linkRepelStrength * alpha;
                        node.vx += distX * force;
                        node.vy += distY * force;
                      }
                    });
                  });
                };
              }
            }}
            

            linkColor={(link) => {
              if (!normalizedQuery) return "#b2d4fa9d";

              const sourceMatch = nodeMatchesSearch(link.source);
              const targetMatch = nodeMatchesSearch(link.target);

              return sourceMatch && targetMatch
                ? "#8eb4df93"
                : "rgba(200,200,200,0.2)";
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.title;
              const fontSize = 12 / globalScale;
              const isHovered = hoveredNode?.id === node.id;
              const matches = nodeMatchesSearch(node);

              const opacity = matches ? 1 : 0.2;
              ctx.globalAlpha = opacity;

              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                isHovered ? 4 : 3,
                0,
                2 * Math.PI,
                false
              );

              ctx.fillStyle = isHovered ? '#b2d4fa' : (matches ? '#b2d4fa' : '#999999');
              ctx.fill();

              ctx.font = `${fontSize}px Segoe UI`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = "#666666";
              ctx.fillText(label, node.x, node.y + 6);
              ctx.globalAlpha = 1;

            }}
          />
          {hoveredNode && (() => {
            const project = projects.find(p => p.id === hoveredNode.id);
            return (
              <div
                className="mini-card"
                style={{
                  position: "fixed",
                  top: hoverPosition.y + 12,
                  left: hoverPosition.x + 12,
                  pointerEvents: "none",
                  zIndex: 5
                }}
              >
                {project?.images?.[0] && (
                  <img 
                    src={project.images[0]} 
                    alt={project.title}
                    className="mini-card-image"
                  />
                )}
                <div className="mini-card-content">
                  <h4>{project.title}</h4>
                  <p>{project.subtitle}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Project Card */}
      {selectedProjectId && (
        <ProjectCard 
          projectId={selectedProjectId} 
          onClose={handleCloseCard}
        />
      )}
    </>
  );
}

export default Portfolio;