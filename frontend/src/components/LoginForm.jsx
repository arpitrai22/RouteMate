import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { initSocket } from "../services/socket";

const LoginForm = ({ onSwitchToSignup }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/auth/login", form);

      console.log("✅ Login success:", res.data); // Debug

      const { token, user } = res.data;

      // Use sessionStorage so each tab/browser can have its own login
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // Initialize socket
      initSocket(token, user.id);

      // Redirect to home
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("❌ Login error:", err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Don’t have an account?{" "}
        <button onClick={onSwitchToSignup}>Signup</button>
      </p>
    </div>
  );
};

export default LoginForm;
