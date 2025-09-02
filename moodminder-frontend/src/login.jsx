import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8182/api/auth/login", {
        email,
        password,
      });

      setMessage(res.data.msg);
      onLogin({ token: res.data.token, userId: res.data.userId });
      navigate("/dashboard");
    } catch (err) {
      setMessage(
        err.response?.data?.msg || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className = 'auth-page'>
    <div className="login-container">
      <div className="login-box">
        <h2>MoodMinder Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="message">{message}</p>}

        <p style={{ marginTop: "10px" }}>
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
    </div>
  );
}

export default Login;
