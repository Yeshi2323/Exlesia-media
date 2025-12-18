import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./Home/Home.jsx";
import News from "./News/News.jsx";
import About from "./About/About.jsx";
import AdminLogin from "./AdminLogin/AdminLogin.jsx";
import "./App.css";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(
    !!localStorage.getItem("admin_token")
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <BrowserRouter>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img
              src="./src/assets/img/exl.png"
              alt="Logo"
              className="logo-img"
            />
          </Link>

          {/* Hamburger menu */}
          <div className="hamburger" onClick={toggleMenu} aria-label="menu">
            <span className={`bar ${menuOpen ? "open" : ""}`}></span>
            <span className={`bar ${menuOpen ? "open" : ""}`}></span>
            <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          </div>

          {/* Navigation links */}
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/news" onClick={() => setMenuOpen(false)}>
                News
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            {!adminLoggedIn && (
              <li>
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/admin"
            element={<AdminLoginWrapper setAdminLoggedIn={setAdminLoggedIn} />}
          />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Exlesia Media. <br></br>rights reserved.
        </p>
      </footer>
    </BrowserRouter>
  );
}

// Wrapper component to handle redirect after login
function AdminLoginWrapper({ setAdminLoggedIn }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    setAdminLoggedIn(true);
    navigate("/news"); // redirect to news after successful login
  };

  return <AdminLogin onLogin={handleLogin} />;
}

export default App;
