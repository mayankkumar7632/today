// KaamSetu - Footer Component

import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">KaamSetu</div>
        <div className="footer-links">
          <span>Trusted hiring</span>
          <span>Verified workers</span>
          <span>Local jobs</span>
        </div>
        <p>&copy; {new Date().getFullYear()} KaamSetu. Connecting daily-wage workers with employers.</p>
      </div>
    </footer>
  );
};

export default Footer;
