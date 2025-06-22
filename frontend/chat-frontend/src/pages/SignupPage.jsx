import React, { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://mychat-brfy.onrender.com/api/v1/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (response.ok) {
        alert("Account created successfully!");
        // Redirect to login page - you can replace this with your routing logic
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to create account"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "20px",
    },
    formContainer: {
      backgroundColor: "white",
      padding: "40px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
    },
    title: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#333",
      fontSize: "24px",
      fontWeight: "300",
      margin: "0 0 30px 0",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "16px",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    buttonDisabled: {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
    spinner: {
      width: "16px",
      height: "16px",
      border: "2px solid #ffffff",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>

        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <input
          name="confirm_password"
          type="password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          style={styles.input}
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {}),
          }}
          onMouseOver={(e) =>
            !isLoading && (e.target.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            !isLoading &&
            (e.target.style.backgroundColor = isLoading ? "#6c757d" : "#007bff")
          }
        >
          {isLoading && <div style={styles.spinner}></div>}
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
