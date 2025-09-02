import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">MoodMinder</Link>
        <div className="d-flex ms-auto">
          {isLoggedIn ? (
            <>
              <Link className="btn btn-outline-light me-2" to="/">Dashboard</Link>
              <button className="btn btn-danger" onClick={handleLogoutClick}>Logout</button>
            </>
          ) : (
            <Link className="btn btn-light" to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
