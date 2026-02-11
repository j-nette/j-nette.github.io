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

  const searchRef = useRef(null);
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const fgRef = useRef();

  // close search with esc
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
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id
      });
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
          <p className="description">
            Tap a dot to view a project.
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

      {/*Graph*/}
      <div className="graph-container">
        <ForceGraph2D
          ref={fgRef}
          width={window.innerWidth}
          height={window.innerHeight * 0.75}
          graphData={graphData}
          backgroundColor="#ffffff"
          nodeRelSize={3}
          linkWidth={3}
          onEngineStop={() => fgRef.current?.zoomToFit(400)}
          onNodeHover={setHoveredNode}
          onNodeClick={handleNodeClick}
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
      </div>

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