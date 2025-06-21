import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form), // form: { email, password }
        // credentials: "include", // Optional: needed if you're using cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store tokens (basic localStorage for now)
      const accessToken = data.token?.[0];
      const refreshToken = data.refresh_token?.[0];

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        throw new Error("Missing tokens in response.");
      }

      // Optional: store user info or redirect
      //   localStorage.setItem(
      //     "user",
      //     JSON.stringify({
      //       uid: data.uid,
      //       username: data.username,
      //       email: data.email,
      //       first_name: data.first_name,
      //       last_name: data.last_name,
      //     })
      //   );

      //   console.log("Login successful:", data);

      // Optional: navigate to dashboard
      navigate("/chat");
    } catch (error) {
      //   console.error("Login error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    loginBox: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      width: "100%",
      maxWidth: "400px",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "24px",
      color: "#333",
      marginBottom: "8px",
      fontWeight: "600",
    },
    subtitle: {
      color: "#666",
      fontSize: "14px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "500",
      color: "#333",
      fontSize: "14px",
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      transition: "border-color 0.2s",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.25)",
    },
    passwordInput: {
      paddingRight: "15px",
    },
    toggleButton: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#666",
      padding: "4px",
    },
    formOptions: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      fontSize: "14px",
    },
    checkboxWrapper: {
      display: "flex",
      alignItems: "center",
    },
    checkbox: {
      marginRight: "6px",
    },
    forgotPassword: {
      background: "none",
      border: "none",
      color: "#007bff",
      cursor: "pointer",
      textDecoration: "none",
      fontSize: "14px",
    },
    submitButton: {
      width: "100%",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      padding: "12px",
      borderRadius: "4px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    submitButtonDisabled: {
      opacity: "0.6",
      cursor: "not-allowed",
    },
    loading: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    spinner: {
      width: "16px",
      height: "16px",
      border: "2px solid #ffffff",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginRight: "8px",
    },
    signupLink: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: "#666",
    },
    signupButton: {
      background: "none",
      border: "none",
      color: "#007bff",
      cursor: "pointer",
      fontWeight: "500",
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
          
          .submit-btn:hover:not(:disabled) {
            background-color: #0056b3 !important;
          }
          
          .forgot-btn:hover {
            text-decoration: underline;
          }
          
          .signup-btn:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <div>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{ ...styles.input, ...styles.passwordInput }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={styles.formOptions}>
            {/* <label style={styles.checkboxWrapper}>
              <input type="checkbox" style={styles.checkbox} />
              <span>Remember me</span>
            </label> */}
            {/* <button
              type="button"
              style={styles.forgotPassword}
              className="forgot-btn"
            >
              Forgot password?
            </button> */}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {}),
            }}
            className="submit-btn"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div style={styles.signupLink}>
          Don't have an account?{" "}
          <button style={styles.signupButton} className="signup-btn">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
