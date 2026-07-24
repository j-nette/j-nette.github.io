import { useMemo, useState, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { forceCollide } from "d3-force-3d";
import { Plus } from "lucide-react";
import projectsData from "../assets/projects";
import { Media } from "../components/Media";
import { saveProjects } from "@authoring/api";
import "../App.css";
import ProjectCard from "./Project";

import peekImage from '../assets/peek.png';


// Scores how well a project matches the search query. Title / tags / technologies
// are primary matches (score 2); words found only in the subtitle or card
// descriptions are a lower-priority match (score 1) so those cards rank below
// direct skill/title hits. Returns 0 when nothing matches.
const getProjectMatchScore = (project, query) => {
  if (!query) return 1;

  const includesQuery = (value) => value?.toLowerCase().includes(query);

  const primaryMatch =
    includesQuery(project.title) ||
    project.tags?.some(includesQuery) ||
    project.technologies?.some(includesQuery);

  if (primaryMatch) return 2;

  const descriptionMatch = [
    project.subtitle,
    project.description1,
    project.description2,
  ].some(includesQuery);

  return descriptionMatch ? 1 : 0;
};


function Portfolio() {
  // Set to true to show the interactive project graph, or false to show the
  // project cards instead. (Mobile always falls back to the cards.)
  const graph_mode = false;

  // Build-time gate: false literal in production; strips authoring UI + save calls.
  const authoring = import.meta.env.DEV;

  // Dev-editable working copy of the project list (seeded from source data).
  const [items, setItems] = useState(projectsData);
  const [draftProject, setDraftProject] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight * 0.75,
  });

  const searchRef = useRef(null);
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const fgRef = useRef();
  const didInitialZoom = useRef(false);

  // mobile/desktop resize?
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight * 0.75,
      });
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

  // react-force-graph exposes the simulation forces through the ref method
  // fgRef.current.d3Force(...), NOT through a `d3Force` prop. Configuring them
  // here gives the nodes real repulsion/spacing/collision so the graph settles
  // into an untangled layout instead of relying on the weak default forces.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    fg.d3Force("charge").strength(-200).distanceMax(400);
    fg.d3Force("link").distance(70).strength(1);
    fg.d3Force("center").strength(0.05);
    fg.d3Force("collide", forceCollide(26));

    fg.d3ReheatSimulation();
  }, []);

   

  //search
  const allSearchTerms = useMemo(() => {
    // De-duplicated index of searchable terms, each tagged with a type label and
    // a popularity count (how many projects use it) so hints can be ranked.
    const index = new Map();

    const add = (rawTerm, type) => {
      if (!rawTerm) return;
      const key = rawTerm.toLowerCase();
      const existing = index.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        index.set(key, { term: rawTerm, type, count: 1 });
      }
    };

    items.forEach((project) => {
      add(project.title, "Project");
      project.tags?.forEach((tag) => add(tag, "Skill"));
      project.technologies?.forEach((tech) => add(tech, "Skill"));
    });

    return Array.from(index.values());
  }, [items]);

  const suggestions = useMemo(() => {
    // No query yet: hint the most popular skills/projects.
    if (!normalizedQuery) {
      return [...allSearchTerms]
        .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
        .slice(0, 5)
        .map((entry) => ({ ...entry, starts: false }));
    }

    // With a query: prefix matches rank above mid-string matches, then by
    // popularity, then alphabetically.
    return allSearchTerms
      .filter((entry) => entry.term.toLowerCase().includes(normalizedQuery))
      .map((entry) => ({
        ...entry,
        starts: entry.term.toLowerCase().startsWith(normalizedQuery),
      }))
      .sort((a, b) => {
        if (a.starts !== b.starts) return a.starts ? -1 : 1;
        if (b.count !== a.count) return b.count - a.count;
        return a.term.localeCompare(b.term);
      })
      .slice(0, 5);
  }, [normalizedQuery, allSearchTerms]);

  // graph
  const graphData = useMemo(() => {
    const nodes = items.map((project) => ({
      id: project.id,
      title: project.title,
      tags: project.tags,
      technologies: project.technologies
    }));

    // Spread the initial positions around a circle so the graph spawns
    // untangled instead of every node stacking at the origin.
    const radius = 160;
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = radius * Math.cos(angle);
      node.y = radius * Math.sin(angle);
    });

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
  }, [items]);

  const nodeMatchesSearch = (node) => {
    if (!normalizedQuery) return true;

    // Nodes only carry a subset of fields, so score against the full project
    // (which includes the descriptions) when available.
    const project = items.find((p) => p.id === node.id) ?? node;
    return getProjectMatchScore(project, normalizedQuery) > 0;
  };

  const filteredProjects = useMemo(() => {
    if (!normalizedQuery) return items;

    // Keep every project that matches, then sort so primary (title/tag/tech)
    // matches come before description-only matches. Array.sort is stable, so
    // projects within the same tier keep their original order.
    return items
      .map((project) => ({
        project,
        score: getProjectMatchScore(project, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.project);
  }, [normalizedQuery, items]);

  const handleNodeClick = (node) => {
    setSelectedProjectId(node.id);
  };

  const handleCloseCard = () => {
    setSelectedProjectId(null);
    setDraftProject(null);
  };

  // The selected project is either the in-progress new draft or an existing item.
  const selectedProject =
    draftProject && draftProject.id === selectedProjectId
      ? draftProject
      : items.find((p) => p.id === selectedProjectId) || null;

  const persistProjects = async (list) => {
    setItems(list);
    if (authoring) {
      try {
        await saveProjects(list);
      } catch (err) {
        alert(`Could not save projects to source: ${err.message}`);
      }
    }
  };

  const handleSaveProject = async (updated) => {
    const exists = items.some((p) => p.id === updated.id);
    const list = exists
      ? items.map((p) => (p.id === updated.id ? updated : p))
      : [...items, updated];
    await persistProjects(list);
    setDraftProject(null);
  };

  const handleDeleteProject = async (id) => {
    await persistProjects(items.filter((p) => p.id !== id));
    setDraftProject(null);
    setSelectedProjectId(null);
  };

  const handleAddProject = () => {
    const id = `project-${Date.now()}`;
    setDraftProject({
      id,
      title: "New Project",
      subtitle: "",
      description1: "",
      description2: "",
      tags: [],
      technologies: [],
      links: {},
      images: [],
    });
    setSelectedProjectId(id);
  };

  // Drag-to-reorder is dev-only and disabled while a search filter is active
  // (so card indices map 1:1 to the underlying list order).
  const canReorder = authoring && !normalizedQuery;

  const handleReorderProjects = (from, to) => {
    if (from == null || to == null || from === to) return;
    const list = [...items];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    persistProjects(list);
  };

  // Keep a node inside the visible graph container. When a node reaches an edge
  // its velocity is reflected (and damped) so it bounces back instead of drifting
  // off screen. Uses screen<->graph conversion so it holds at any zoom level.
  const boundNodeToViewport = (node) => {
    const fg = fgRef.current;
    if (!fg) return;

    const margin = 16;
    const topLeft = fg.screen2GraphCoords(0, 0);
    const bottomRight = fg.screen2GraphCoords(dimensions.width, dimensions.height);
    const minX = Math.min(topLeft.x, bottomRight.x) + margin;
    const maxX = Math.max(topLeft.x, bottomRight.x) - margin;
    const minY = Math.min(topLeft.y, bottomRight.y) + margin;
    const maxY = Math.max(topLeft.y, bottomRight.y) - margin;

    if (node.x < minX) { node.x = minX; node.vx = Math.abs(node.vx || 0) * 0.6; }
    else if (node.x > maxX) { node.x = maxX; node.vx = -Math.abs(node.vx || 0) * 0.6; }
    if (node.y < minY) { node.y = minY; node.vy = Math.abs(node.vy || 0) * 0.6; }
    else if (node.y > maxY) { node.y = maxY; node.vy = -Math.abs(node.vy || 0) * 0.6; }

    // Keep a dragged node's fixed target within bounds too.
    if (node.fx !== undefined) node.fx = Math.max(minX, Math.min(maxX, node.fx));
    if (node.fy !== undefined) node.fy = Math.max(minY, Math.min(maxY, node.fy));
  };


  return (
    <>
      <div className="portfolio-header">
        <div className="portfolio-header-text">
          <h1 className="portfolio-title">My Little Creations</h1>
          <p className="description portfolio-subtitle">
            {graph_mode
              ? "Hover over a dot to preview and tap it to learn more."
              : "Click into a project card to learn more."}
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

      {/*reponsiveness*/}
      {!graph_mode || isMobile ? (
        <div className="mobile-grid-container">
          <div className="mobile-grid">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className={`mobile-mini-card${
                  canReorder && dragIndex === index ? " dragging" : ""
                }${
                  canReorder && dragOverIndex === index && dragIndex !== index
                    ? " drag-over"
                    : ""
                }`}
                onClick={() => setSelectedProjectId(project.id)}
                draggable={canReorder}
                onDragStart={
                  canReorder ? () => setDragIndex(index) : undefined
                }
                onDragOver={
                  canReorder
                    ? (e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }
                    : undefined
                }
                onDragLeave={
                  canReorder ? () => setDragOverIndex(null) : undefined
                }
                onDrop={
                  canReorder
                    ? (e) => {
                        e.preventDefault();
                        handleReorderProjects(dragIndex, index);
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }
                    : undefined
                }
                onDragEnd={
                  canReorder
                    ? () => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }
                    : undefined
                }
              >
                {project?.images?.[0] && (
                  <Media
                    filename={project.images[0]}
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
            {authoring && (
              <button
                type="button"
                className="mobile-mini-card dev-add-tile"
                onClick={handleAddProject}
              >
                <Plus size={28} />
                <span>Add project</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="graph-container"
          onMouseMove={(e) => setHoverPosition({ x: e.clientX, y: e.clientY })}
        >
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            //backgroundColor="#ffffff"
            nodeRelSize={3}
            linkWidth={3}
            minZoom={0.4}
            maxZoom={8}
            

            onNodeDrag={(node) => boundNodeToViewport(node)}
            onNodeDragEnd={(node) => {
              node.fx = undefined;
              node.fy = undefined;

              // Bounce: re-energize the layout so it re-settles and untangles.
              graphData.nodes.forEach((n) => {
                n.vx = (n.vx || 0) + (Math.random() - 0.5) * 6;
                n.vy = (n.vy || 0) + (Math.random() - 0.5) * 6;
              });
              fgRef.current?.d3ReheatSimulation();
            }}

            //wip make card appear on top of node?
            onNodeHover={(node) => {
              setHoveredNode(node || null);
            }}
            
            onNodeClick={handleNodeClick}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.4}
            warmupTicks={60}
            cooldownTicks={200}
            onEngineTick={() => graphData.nodes.forEach(boundNodeToViewport)}
            onEngineStop={() => {
              if (!didInitialZoom.current) {
                fgRef.current?.zoomToFit(400, 80);
                didInitialZoom.current = true;
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
            const project = items.find(p => p.id === hoveredNode.id);
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
                  <Media
                    filename={project.images[0]}
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
      {selectedProject && (
        <ProjectCard
          project={selectedProject}
          onClose={handleCloseCard}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          canEdit={authoring}
          startInEdit={!!draftProject && draftProject.id === selectedProjectId}
        />
      )}
    </>
  );
}

export default Portfolio;
