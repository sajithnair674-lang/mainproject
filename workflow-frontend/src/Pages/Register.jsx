
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await API.post("register/", formData);

            setSuccess("Registration successful! You can now sign in.");

            setFormData({
                username: "",
                email: "",
                first_name: "",
                last_name: "",
                password: "",
            });

        } catch (error) {
            console.error(
                "Registration error:",
                error.response?.data || error.message
            );

            const responseData = error.response?.data;

            const errorMessage = responseData
                ? Object.entries(responseData)
                    .map(([field, messages]) =>
                        `${field}: ${
                            Array.isArray(messages)
                                ? messages.join(", ")
                                : messages
                        }`
                    )
                    .join(" | ")
                : "Unable to register. Please try again.";

            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <div className="login-brand-wrapper">
                    <div className="login-brand-icon">W</div>
                    <h1 className="login-brand">WorkFlow</h1>
                </div>

                <div className="login-heading">
                    <h2>Create your account</h2>
                    <p className="login-subtitle">
                        Register to view your workspace.
                    </p>
                </div>

                {error && (
                    <div className="login-error" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="register-success" role="status">
                        {success}
                        <br />
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Go to Sign In →
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleRegister}
                    className="login-form"
                >
                    <div className="login-field">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={6}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                        {!loading && <span> →</span>}
                    </button>
                </form>

                <p className="register-login-link">
                    Already have an account?{" "}
                    <Link to="/login">Sign in</Link>
                </p>

                <div className="login-footer">
                    <span className="footer-dot"></span>
                    Guest account · Read-only access
                </div>

            </div>

            <p className="login-copyright">
                © {new Date().getFullYear()} WorkFlow.
                All rights reserved.
            </p>
        </div>
    );
}

export default Register;
