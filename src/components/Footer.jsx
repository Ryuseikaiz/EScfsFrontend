import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          Developed by{' '}
          <a 
            href="https://github.com/Ryuseikaiz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            @Ryuseikaiz
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
