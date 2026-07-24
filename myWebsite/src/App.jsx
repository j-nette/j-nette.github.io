import './App.css';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import cloudImage from './assets/cloud.png';
import Typing from './assets/components';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Daydreams from './pages/Daydreams';

// Toggle this to enable/disable the light/dark mode feature.
// When false, the site stays in light mode and the toggle button is hidden.
const THEME_TOGGLE_ENABLED = false;


function NotFound() {
  return (
    <div className="app">
      <div className="not-found">
        <h1 className="greeting">404</h1>
        <p className="description">Oops! This page floated away into the clouds.</p>
        <Link to="/" className="button">Take Me Home</Link>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(
    () => (THEME_TOGGLE_ENABLED && localStorage.getItem("theme")) || "light"
  );

  useEffect(() => {
    const active = THEME_TOGGLE_ENABLED ? theme : "light";
    document.documentElement.setAttribute("data-theme", active);
    if (THEME_TOGGLE_ENABLED) {
      localStorage.setItem("theme", active);
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <HashRouter>
      <nav className="navbar">
        <ul className="nav-links">
          <li className='nav-link'><Link to="/">Home</Link></li>
          <li className='nav-link'><Link to="/portfolio">Portfolio</Link></li>
          <li className='nav-link'><Link to="/daydreams">Daydreams</Link></li>
          <li className='nav-link'><Link to="/about">About</Link></li>

        </ul>
        {THEME_TOGGLE_ENABLED && (
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
            title={theme === "dark" ? "Day mode" : "Night mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
      </nav>

      <Routes>
        {/* Home page */}
        <Route path="/" element={
          <div className="app">
            <div className="container">
              <div className="left-section">
                <div className="floating-image">
                  <img 
                    src={cloudImage} 
                    alt="My Sprite!" 
                  />
                </div>
              </div>
              
              <div className="right-section">
                <h1 className="greeting">Hey, I'm Jeanette!</h1>
                <Typing/>
                <p className="description beep-boop">I like making things go beep boop.</p>
                <div className="button-group">
                  <Link to="/portfolio" className="button">View My Work</Link>
                  <Link to="/about" className="button">Let's Connect</Link>
                </div>
              </div>
            </div>
          </div>
        } />

        {/* Other pages */}
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/daydreams" element={<Daydreams />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;