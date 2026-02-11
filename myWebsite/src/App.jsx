import './App.css';
import cloudImage from './assets/cloud.png';
import Typing from './assets/components';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {/*<li><Link to="/about">About</Link></li>*/}
          <li><Link to="/portfolio">Portfolio</Link></li>
          {/*<li><Link to="/contact">Contact</Link></li>*/}
        </ul>
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
                <p className="description">I like making things go beep boop.</p>
                <div className="button-group">
                  <button><Link to="/portfolio">View My Work</Link></button>
                  {/*<button><Link to="/contact">Let's Connect</Link></button>*/}
                </div>
              </div>
            </div>
          </div>
        } />

        {/* Other pages */}
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;