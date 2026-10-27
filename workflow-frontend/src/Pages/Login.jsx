
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await API.post("login/", {
                username: username.trim(),
                password: password,
            });

            // Store JWT tokens
            localStorage.setItem(
                "access_token",
                response.data.access
            );

            localStorage.setItem(
                "refresh_token",
                response.data.refresh
            );

            // Store user information
            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            // Navigate to dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                "Invalid username or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">


                <h1 className="login-brand">
                    WorkFlow<span> Pro</span>
                </h1>

                <h2>Welcome back!</h2>

                <p className="login-subtitle">
                    Sign in to continue to your workspace.
                </p>

                {error && (
                    <div className="login-error" role="alert">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="login-form"
                >
                    <div className="login-field">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                        {!loading && <span> →</span>}
                    </button>
                </form>

                <div className="login-footer">
                    <span className="footer-dot"></span>
                    Secure workspace access
                </div>

            </div>

            <p className="login-copyright">
                © {new Date().getFullYear()} WorkFlow Pro.
                All rights reserved.
            </p>
        </div>
    );
}

export default Login;
