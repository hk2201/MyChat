import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/v1/auth/signup", form);
    navigate("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className="input"
      />
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="input"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        className="input"
      />
      <button type="submit" className="btn">
        Sign Up
      </button>
    </form>
  );
}
