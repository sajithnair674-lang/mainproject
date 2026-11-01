
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    TrendingUp,
    CircleCheck,
    Clock3,
    ListChecks,
    Circle,
    Timer,
    Eye,
    CheckCircle2,
    Ban,
    Bell,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

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
                    error.response?.data || error.message
                );
                setError("Unable to load dashboard data.");
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
                    error.response?.data || error.message
                );
            }
        };

        fetchDashboard();
        fetchUnreadCount();
    }, []);

    const projectCards = data
        ? [
            {
                title: "Total Projects",
                value: data.projects?.total || 0,
                icon: FolderKanban,
            },
            {
                title: "Active Projects",
                value: data.projects?.active || 0,
                icon: TrendingUp,
            },
            {
                title: "Completed Projects",
                value: data.projects?.completed || 0,
                icon: CircleCheck,
            },
            {
                title: "Planning",
                value: data.projects?.planning || 0,
                icon: Clock3,
            },
        ]
        : [];

    const taskCards = data
        ? [
            {
                title: "Total Tasks",
                value: data.tasks?.total || 0,
                icon: ListChecks,
            },
            {
                title: "To Do",
                value: data.tasks?.todo || 0,
                icon: Circle,
            },
            {
                title: "In Progress",
                value: data.tasks?.in_progress || 0,
                icon: Timer,
            },
            {
                title: "In Review",
                value: data.tasks?.in_review || 0,
                icon: Eye,
            },
            {
                title: "Completed",
                value: data.tasks?.completed || 0,
                icon: CheckCircle2,
            },
            {
                title: "Blocked",
                value: data.tasks?.blocked || 0,
                icon: Ban,
            },
        ]
        : [];

    const formatPriority = (key) => {
        return key
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (error) {
        return (
            <div className="dashboard">
                <div className="dashboard-error">
                    <div className="dashboard-error-icon">
                        <AlertCircle size={30} />
                    </div>

                    <h2>Unable to load dashboard</h2>
                    <p>{error}</p>

                    <button
                        type="button"
                        className="dashboard-retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="dashboard">
                <div className="dashboard-loading">
                    <div className="dashboard-loading-icon">
                        <FolderKanban size={30} />
                    </div>

                    <h2>Loading dashboard...</h2>
                    <p>Please wait while we load your workspace.</p>
                </div>
            </div>
        );
    }

    const priorityIcons = {
        low: Circle,
        medium: Clock3,
        high: TrendingUp,
        urgent: AlertCircle,
    };

    return (
        <div className="dashboard">

            {/* DASHBOARD HEADER */}
            <header className="dashboard-header">
                <div className="dashboard-heading">
                    <span className="dashboard-page-label">
                        Overview
                    </span>

                    <h1>WorkFlow Dashboard</h1>

                    <p>
                        Welcome back,{" "}
                        <strong>{user?.username || "User"}</strong>!
                    </p>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        type="button"
                        className="notification-header-button"
                        onClick={() => navigate("/notifications")}
                        title="Notifications"
                        aria-label="Open notifications"
                    >
                        <Bell size={21} />

                        {unreadCount > 0 && (
                            <span className="notification-header-badge">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <span className="role-badge">
                        {user?.role || "MEMBER"}
                    </span>

                    <LogoutButton />
                </div>
            </header>

            {/* PROJECTS */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <div>
                        <h2>Projects</h2>
                        <p>
                            Overview of your project workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-view-btn"
                        onClick={() => navigate("/projects")}
                    >
                        View Projects →
                    </button>
                </div>

                <div className="stats-grid">
                    {projectCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                type="button"
                                className="stat-card dashboard-stat-card"
                                key={item.title}
                                onClick={() => navigate("/projects")}
                            >
                                <div className="stat-card-top">
                                    <span className="stat-card-icon">
                                        <Icon size={22} />
                                    </span>

                                    <span className="stat-card-arrow">
                                        →
                                    </span>
                                </div>

                                <p>{item.title}</p>
                                <h3>{item.value}</h3>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* TASKS */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <div>
                        <h2>Tasks</h2>
                        <p>
                            Track your team's current workload.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-view-btn"
                        onClick={() => navigate("/tasks")}
                    >
                        View Tasks →
                    </button>
                </div>

                <div className="stats-grid">
                    {taskCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                type="button"
                                className="stat-card dashboard-stat-card"
                                key={item.title}
                                onClick={() => navigate("/tasks")}
                            >
                                <div className="stat-card-top">
                                    <span className="stat-card-icon">
                                        <Icon size={22} />
                                    </span>

                                    <span className="stat-card-arrow">
                                        →
                                    </span>
                                </div>

                                <p>{item.title}</p>
                                <h3>{item.value}</h3>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* TASK PRIORITY */}
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <div>
                        <h2>Task Priority</h2>
                        <p>
                            Current task distribution by priority.
                        </p>
                    </div>
                </div>

                <div className="stats-grid">
                    {Object.entries(data.priority || {}).map(
                        ([key, value]) => {
                            const Icon =
                                priorityIcons[key.toLowerCase()] || Circle;

                            return (
                                <button
                                    type="button"
                                    className="stat-card dashboard-stat-card"
                                    key={key}
                                    onClick={() => navigate("/tasks")}
                                >
                                    <div className="stat-card-top">
                                        <span className="stat-card-icon">
                                            <Icon size={22} />
                                        </span>

                                        <span className="stat-card-arrow">
                                            →
                                        </span>
                                    </div>

                                    <p>{formatPriority(key)}</p>
                                    <h3>{value}</h3>
                                </button>
                            );
                        }
                    )}
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
