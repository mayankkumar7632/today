import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { value: '5k+', label: 'verified workers' },
    { value: '1.2k+', label: 'active employers' },
    { value: '98%', label: 'repeat hiring rate' },
    { value: '24/7', label: 'job visibility' },
  ];

  const values = [
    {
      title: 'Trusted connections',
      text: 'We provide a secure environment where workers and employers can connect with clarity, confidence, and accountability.',
    },
    {
      title: 'Local-first opportunity',
      text: 'Jobs are matched around location, skill, and availability to reduce delays and make hiring more practical.',
    },
    {
      title: 'Fair growth',
      text: 'Our platform supports better visibility, easier applications, and a more transparent way to build long-term work relationships.',
    },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="eyebrow eyebrow-dark">About KaamSetu</span>
          <h1>Empowering everyday work through trustworthy connections.</h1>
          <p>
            KaamSetu was built to bridge the gap between local workers and employers with a
            simple, professional, and dependable hiring platform. We believe good work should be
            easier to find, easier to trust, and easier to deliver.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Join Now
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Explore Jobs
            </Link>
          </div>
        </div>

        <div className="about-hero-visual" aria-label="People collaborating in the workplace" />
      </section>

      <section className="about-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="about-stat-card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="about-story">
        <div className="story-copy">
          <span className="eyebrow eyebrow-dark">Our mission</span>
          <h2>Making local work access more visible, fair, and efficient.</h2>
          <p>
            We are building a platform that supports workers seeking dependable opportunities and employers
            looking for reliable, skilled people nearby. By combining verification, local matching, and clear
            communication, KaamSetu helps reduce uncertainty in daily hiring.
          </p>
        </div>
        <div className="story-panel">
          <div className="mini-card">
            <h3>What we stand for</h3>
            <ul>
              <li>Trust and transparency</li>
              <li>Access to real opportunities</li>
              <li>Better local hiring decisions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="section-heading">
          <span className="eyebrow eyebrow-dark">Why it matters</span>
          <h2>Built around the real needs of workers and employers.</h2>
        </div>

        <div className="value-grid">
          {values.map((value) => (
            <div key={value.title} className="value-card">
              <div className="icon-badge">✦</div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
