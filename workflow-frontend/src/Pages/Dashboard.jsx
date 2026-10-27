
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";
import LogoutButton from "../components/LogoutButton";

function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get("dashboard/");
                setData(response.data);
            } catch (error) {
                console.error(
                    error.response?.data ||
                    error.message
                );

                setError(
                    "Unable to load dashboard data."
                );
            }
        };

        const fetchUnreadCount = async () => {
            try {
                const response = await API.get(
                    "tasks/notifications/unread-count/"
                );

                setUnreadCount(
                    response.data.unread_count ||
                    response.data.count ||
                    0
                );
            } catch (error) {
                console.error(
                    "Unread notification error:",
                    error.response?.data ||
                    error.message
                );
            }
        };

        fetchDashboard();
        fetchUnreadCount();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!data) {
        return <p>Loading dashboard...</p>;
    }

    const projectCards = [
        {
            title: "Total Projects",
            value: data.projects.total
        },
        {
            title: "Active Projects",
            value: data.projects.active
        },
        {
            title: "Completed Projects",
            value: data.projects.completed
        },
        {
            title: "Planning",
            value: data.projects.planning
        },
    ];

    const taskCards = [
        {
            title: "Total Tasks",
            value: data.tasks.total
        },
        {
            title: "To Do",
            value: data.tasks.todo
        },
        {
            title: "In Progress",
            value: data.tasks.in_progress
        },
        {
            title: "In Review",
            value: data.tasks.in_review
        },
        {
            title: "Completed",
            value: data.tasks.completed
        },
        {
            title: "Blocked",
            value: data.tasks.blocked
        },
    ];

    return (
        <div className="dashboard">

            {/* DASHBOARD HEADER */}

            <header className="dashboard-header">

                <div>
                    <h1>
                        WorkFlow Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        {user?.username || "User"}!
                    </p>
                </div>

                <div className="dashboard-header-actions">

                    {/* NOTIFICATION BUTTON */}

                    <button
                        className="notification-header-button"
                        onClick={() =>
                            navigate("/notifications")
                        }
                        title="Notifications"
                    >
                        🔔

                        {unreadCount > 0 && (
                            <span className="notification-header-badge">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* ROLE */}

                    <span className="role-badge">
                        {user?.role || "MEMBER"}
                    </span>

                    {/* LOGOUT */}

                    <LogoutButton />

                </div>

            </header>


            {/* PROJECTS */}

            <section>

                <h2>Projects</h2>

                <div className="stats-grid">

                    {projectCards.map((item) => (

                        <div
                            className="stat-card"
                            key={item.title}
                        >

                            <p>
                                {item.title}
                            </p>

                            <h3>
                                {item.value}
                            </h3>

                        </div>

                    ))}

                </div>

            </section>


            {/* TASKS */}

            <section>

                <h2>Tasks</h2>

                <div className="stats-grid">

                    {taskCards.map((item) => (

                        <div
                            className="stat-card"
                            key={item.title}
                        >

                            <p>
                                {item.title}
                            </p>

                            <h3>
                                {item.value}
                            </h3>

                        </div>

                    ))}

                </div>

            </section>


            {/* TASK PRIORITY */}

            <section>

                <h2>Task Priority</h2>

                <div className="stats-grid">

                    {Object.entries(data.priority).map(
                        ([key, value]) => (

                            <div
                                className="stat-card"
                                key={key}
                            >

                                <p>
                                    {key
                                        .replace("_", " ")
                                        .toUpperCase()}
                                </p>

                                <h3>
                                    {value}
                                </h3>

                            </div>

                        )
                    )}

                </div>

            </section>

        </div>
    );
}

export default Dashboard;