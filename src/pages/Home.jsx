// src/pages/Home.jsx
import "../styles/home.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const ROLES = [
  {
    key: "teacher",
    to: "/teacher-login",
    emoji: "👩‍🏫",
    title: "TEACHER",
    desc: "Manage classes, attendance, exams and more",
    cta: "Go to Teacher Panel",
  },
  {
    key: "student",
    to: "/student-login",
    emoji: "🎓",
    title: "STUDENT",
    desc: "Access results, homework, timetable and profile",
    cta: "Go to Student Portal",
  },
  {
    key: "cashier",
    to: "/cashier-login",
    emoji: "💰",
    title: "CASHIER",
    desc: "Record payments and manage school fees",
    cta: "Go to Cashier Panel",
  },
  {
    key: "parent",
    to: "/parent-login",
    emoji: "👨‍👩‍👧",
    title: "PARENT",
    desc: "Track your child's progress and performance",
    cta: "Go to Parent Portal",
  },
];

const FEATURES = [
  { emoji: "🛡️", title: "Secure & Safe", desc: "Your data is protected with top security" },
  { emoji: "📈", title: "Real-time Reports", desc: "Get instant insights and analytics" },
  { emoji: "🔔", title: "Smart Notifications", desc: "Stay updated with real-time alerts" },
  { emoji: "☁️", title: "Cloud Based", desc: "Access anytime, anywhere from any device" },
  { emoji: "📱", title: "Mobile Friendly", desc: "Fully responsive on all devices" },
  { emoji: "🎧", title: "24/7 Support", desc: "We're here to help you anytime" },
];

// Admin contact info — waxaa loo isticmaalaa "Need Help?" menu-ga
const SUPPORT_WHATSAPP = "252617390261"; // international format, no + or leading 0
const SUPPORT_EMAIL = "risingstar0261@gmail.com";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="home">
      <header className="home-header">
        <div className="brand">
          <img src={logo} className="brand-logo" alt="Rising School logo" />
          <div className="brand-text">
            <span className="brand-name">RISING SCHOOL</span>
            <span className="brand-tagline">School Management ERP System</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="menu-wrap" ref={helpRef}>
            <button
              type="button"
              className="help-pill"
              onClick={() => setHelpOpen((v) => !v)}
            >
              <span className="help-icon">?</span>
              Need Help?
            </button>

            {helpOpen && (
              <div className="dots-menu help-menu">
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dots-menu-item"
                >
                  💬 WhatsApp: 0{SUPPORT_WHATSAPP.slice(3)}
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="dots-menu-item">
                  📧 {SUPPORT_EMAIL}
                </a>
              </div>
            )}
          </div>

          <div className="menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="dots-btn"
              aria-label="More options"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="dots-menu">
                <Link to="/admin-login" className="dots-menu-item">
                  👑 Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Welcome to</p>
          <h1 className="hero-title">RISING SCHOOL</h1>
          <h2 className="hero-subtitle">School Management ERP System</h2>
          <div className="hero-rule" />
          <p className="hero-lede">
            A complete solution to manage your school efficiently.
            <br />
            Smart. Simple. Secure.
          </p>
        </div>

        <div className="hero-art" aria-hidden="true">
          <svg viewBox="0 0 520 420" className="school-illustration">
            <circle cx="330" cy="130" r="150" className="art-ring" />
            <g className="art-leaves">
              <path d="M60 90 Q80 70 100 90 Q80 110 60 90 Z" />
              <path d="M40 130 Q58 116 76 130 Q58 144 40 130 Z" />
            </g>

            <rect x="120" y="150" width="320" height="230" rx="6" className="art-building" />
            <rect x="150" y="90" width="80" height="60" className="art-tower" />
            <polygon points="150,90 190,60 230,90" className="art-roof" />
            <circle cx="190" cy="115" r="14" className="art-clock" />
            <line x1="190" y1="115" x2="190" y2="106" className="art-clock-hand" />
            <line x1="190" y1="115" x2="197" y2="118" className="art-clock-hand" />

            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <rect
                  key={`${row}-${col}`}
                  x={140 + col * 48}
                  y={185 + row * 42}
                  width="26"
                  height="26"
                  rx="2"
                  className="art-window"
                />
              ))
            )}

            <rect x="235" y="320" width="50" height="60" rx="3" className="art-door" />
            <circle cx="272" cy="352" r="2.5" className="art-door-knob" />

            <ellipse cx="280" cy="382" rx="220" ry="14" className="art-ground" />
          </svg>
        </div>
      </section>

      <section className="roles-grid">
        {ROLES.map((role) => (
          <Link key={role.key} className={`role-card role-${role.key}`} to={role.to}>
            <span className="role-corner" aria-hidden="true" />
            <span className="role-avatar">{role.emoji}</span>
            <h3 className="role-title">{role.title}</h3>
            <p className="role-desc">{role.desc}</p>
            <span className="role-cta">
              {role.cta}
              <span className="role-arrow">➜</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="features-strip">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <span className="feature-icon">{f.emoji}</span>
            <h4 className="feature-title">{f.title}</h4>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="home-footer">
        © {new Date().getFullYear()} Rising School. All rights reserved.
      </footer>
    </div>
  );
}
