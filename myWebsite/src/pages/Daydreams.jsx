import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import daydreams from "../assets/daydreams";
import cloudDefault from "../assets/homeBG.png";
import "../App.css";

function DaydreamReader({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="project-card-overlay" onClick={onClose}>
      <div className="project-card-container blog-reader" onClick={(e) => e.stopPropagation()}>
        <div className="project-card-header">
          <div className="project-card-header-top">
            <h1 className="project-card-title">{post.title}</h1>
            <button onClick={onClose} className="project-card-close-btn">
              <X size={24} />
            </button>
          </div>

          <p className="description project-card-subtitle">
            {post.date} · {post.readTime}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="project-card-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="project-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="project-card-content">
          {post.body.map((paragraph, index) => (
            <div key={index} className="project-card-description">
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Daydreams() {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const selectedPost = daydreams.find((post) => post.id === selectedPostId);

  const [featured, ...rest] = daydreams;

  // Use the post's first photo when it has one, otherwise fall back to the clouds.
  const featuredImage =
    (featured?.photos && featured.photos.length > 0 && featured.photos[0]) ||
    cloudDefault;

  return (
    <>
      <div className="blog-header">
        <h1 className="blog-title">Daydreams</h1>
        <p className="description blog-subtitle">
          A little corner for my thoughts, musings, and half-baked ideas.
        </p>
      </div>

      <div className="blog-container">
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
                <span>{featured.readTime}</span>
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
                <div className="blog-list-date">{post.date}</div>
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
        <DaydreamReader post={selectedPost} onClose={() => setSelectedPostId(null)} />
      )}
    </>
  );
}

export default Daydreams;
