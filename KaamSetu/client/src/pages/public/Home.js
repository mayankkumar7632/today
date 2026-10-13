// KaamSetu - Home Page
// Attractive landing page explaining the platform

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const trustStats = [
    { value: '5k+', label: 'verified workers' },
    { value: '1.2k+', label: 'active employers' },
    { value: '98%', label: 'repeat hiring rate' },
    { value: '24/7', label: 'job visibility' },
  ];

  const benefits = [
    {
      icon: '📍',
      title: 'Local opportunities',
      text: 'Discover jobs close to home, reducing travel time and making hiring faster.',
    },
    {
      icon: '🧠',
      title: 'Smart matching',
      text: 'Our recommendation engine aligns skills, experience, and wage expectations.',
    },
    {
      icon: '✅',
      title: 'Verified trust',
      text: 'Profiles and verification checks build confidence for workers and employers.',
    },
    {
      icon: '⭐',
      title: 'Transparent ratings',
      text: 'Real feedback creates accountability and improves long-term reliability.',
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="hero-badge">Trusted local hiring platform</span>
            <h1>Find work faster. Hire smarter.</h1>
            <p className="hero-subtitle">
              KaamSetu connects daily-wage workers with reliable employers through a clear,
              secure, and location-aware marketplace built for everyday opportunities.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Find Work
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large">
                Hire Workers
              </Link>
              <Link to="/admin/dashboard" className="btn btn-warning btn-large">
                Admin Panel
              </Link>
            </div>
            <div className="hero-trust">
              <span>• Verified profiles</span>
              <span>• Quick applications</span>
              <span>• Local matching</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Workers and employers collaborating">
            <div className="hero-visual-card">
              <strong>1,200+</strong>
              <p>New jobs matched this week</p>
              <div className="hero-visual-tags">
                <span>Skilled</span>
                <span>Nearby</span>
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Platform stats">
        {trustStats.map((item) => (
          <div key={item.label} className="trust-item">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="about-showcase">
        <div className="section-heading">
          <span className="eyebrow">About KaamSetu</span>
          <h2>Making local work access more visible, fair, and efficient.</h2>
        </div>

        <div className="about-showcase-grid">
          <div className="about-showcase-copy">
            <p>
              KaamSetu is a trusted digital bridge between workers and employers, built to make
              local hiring easier, safer, and more transparent. We help people discover real
              opportunities, connect faster, and work with more confidence.
            </p>
            <p>
              From verification and smart matching to clear communication and feedback, the platform
              is designed to support everyday work relationships in a more structured, professional way.
            </p>
          </div>

          <div className="about-showcase-panel">
            <h3>What we focus on</h3>
            <ul>
              <li>Trust and transparency</li>
              <li>Local opportunity matching</li>
              <li>Reliable hiring decisions</li>
              <li>Better worker-employer experience</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Built for reliable day-to-day hiring</h2>
        </div>

        <div className="workflow-section">
          <h3>For Workers</h3>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Create Profile</h4>
              <p>Add your skills, experience, and location so employers can discover you.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Find Jobs</h4>
              <p>Browse nearby jobs that match your strengths and availability.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Apply</h4>
              <p>Send a quick application and connect with interested employers.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Work & earn</h4>
              <p>Complete assignments confidently and build a stronger reputation.</p>
            </div>
            <div className="step-card">
              <div className="step-number">5</div>
              <h4>Get rated</h4>
              <p>Earn trust through ratings and repeat work opportunities.</p>
            </div>
          </div>
        </div>

        <div className="workflow-section">
          <h3>For Employers</h3>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Post a job</h4>
              <p>Describe the work, location, and daily wage clearly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Shortlist workers</h4>
              <p>Review recommended candidates based on location and skills.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Hire with confidence</h4>
              <p>Check profiles, reviews, and verification before choosing.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Track progress</h4>
              <p>Monitor applications and keep your hiring process organized.</p>
            </div>
            <div className="step-card">
              <div className="step-number">5</div>
              <h4>Rate and repeat</h4>
              <p>Build a reliable network of skilled workers for future jobs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="section-heading">
          <span className="eyebrow">Why KaamSetu</span>
          <h2>Everything you need for trusted hiring</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="benefit-card">
              <span className="benefit-icon">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="value-panel">
        <div className="value-copy">
          <span className="eyebrow eyebrow-inverse">Professional workforce platform</span>
          <h2>Purpose-built to simplify hiring and reduce uncertainty.</h2>
          <p>
            KaamSetu creates a more structured and trustworthy path between workers and employers,
            helping everyone move faster and work with better confidence.
          </p>
        </div>
        <div className="value-points">
          <div>
            <strong>Faster hiring</strong>
            <span>Connect in minutes instead of waiting on manual referrals.</span>
          </div>
          <div>
            <strong>Better fit</strong>
            <span>Match the right worker to the right job using skills and location.</span>
          </div>
          <div>
            <strong>More trust</strong>
            <span>Verification and feedback improve safety and transparency.</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to get started?</h2>
        <p>Join KaamSetu today and connect with opportunities that match your goals.</p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-large">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
