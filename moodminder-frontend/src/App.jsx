import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedToken = localStorage.getItem("token");
    if (savedUserId && savedToken) {
      setUserId(savedUserId);
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (data) => {
    setUserId(data.userId);
    setToken(data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("token", data.token);
  };

  const handleLogout = () => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={
            userId ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* Login Page */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Dashboard Page (Protected) */}
        <Route
          path="/dashboard"
          element={
            userId ? (
              <Dashboard userId={userId} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all invalid routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;