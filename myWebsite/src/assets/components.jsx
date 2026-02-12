import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

function Typing() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: ["Roboticist", "Scholar", "Technical Project Manager","Software Developer", "Creator", "Community Builder"],
      typeSpeed: 30,
      backSpeed: 20,
      loop: true,      
      showCursor: true,   
      cursorChar: '|'
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
      <p className="profession">
        <span ref={typedElement}></span>
      </p>
  );
}

export default Typing;