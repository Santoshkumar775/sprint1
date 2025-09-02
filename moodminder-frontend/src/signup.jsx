import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8182/api/auth/signup", {
        name,
        email,
        password,
      });

      setMessage(res.data.msg || "Signup successful!");
      // redirect to login after successful signup
      setTimeout(() => navigate("/login"), 1500);
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
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <button type="submit">Sign Up</button>
        </form>
        {message && <p className="message">{message}</p>}

        <p style={{ marginTop: "10px" }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
    </div>
  );
}

export default Signup;
