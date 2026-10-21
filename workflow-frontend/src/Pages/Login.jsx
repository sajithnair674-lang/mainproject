import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        try {

            const response = await API.post("login/", {
               username: username,
              password: password
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
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            // Go to dashboard
            navigate("/dashboard");

        } catch (error) {

            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Invalid username or password."
            );
        }
    };

    return (
        <div>

            <h1>WorkFlow</h1>

            <h2>Login</h2>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleLogin}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;