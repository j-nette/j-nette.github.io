import './App.css';
import cloudImage from './assets/cloud.png';
import Typing from './assets/components';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Portfolio from './pages/Portfolio';


function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <ul className="nav-links">
          <li className='nav-link'><Link to="/">Home</Link></li>
          <li className='nav-link'><Link to="/portfolio">Portfolio</Link></li>
          <li className='nav-link'><Link to="/about">About</Link></li>

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;