
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    Plus,
    X,
    CalendarDays,
    ArrowRight,
    Clock3,
    CircleCheck,
    CircleAlert,
    RefreshCw,
} from "lucide-react";

import API from "../services/Api";
import "../App.css";

function Projects() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        start_date: "",
        due_date: "",
        status: "PLANNING",
    });

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const canCreateProject =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("projects/");

            const projectData = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setProjects(projectData);
        } catch (error) {
            console.error(
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            start_date: "",
            due_date: "",
            status: "PLANNING",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSaving(true);

        try {
            await API.post("projects/", formData);

            resetForm();
            setShowForm(false);

            await fetchProjects();
        } catch (error) {
            console.error(
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.detail ||
                "Unable to create project."
            );
        } finally {
            setSaving(false);
        }
    };

    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "PLANNING":
                return "project-status planning";

            case "ACTIVE":
                return "project-status active";

            case "COMPLETED":
                return "project-status completed";

            case "ON_HOLD":
                return "project-status on-hold";

            default:
                return "project-status";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not set";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="projects-page">
                <div className="projects-header">
                    <div>
                        <span className="page-label">
                            Workspace
                        </span>

                        <h1>Projects</h1>

                        <p>
                            Manage and track your team projects.
                        </p>
                    </div>
                </div>

                <div className="projects-loading">
                    <div className="projects-loading-icon">
                        <FolderKanban size={30} />
                    </div>

                    <h3>Loading projects...</h3>

                    <p>
                        Please wait while we load your projects.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="projects-page">

            {/* HEADER */}
            <div className="projects-header">
                <div>
                    <span className="page-label">
                        Workspace
                    </span>

                    <h1>Projects</h1>

                    <p>
                        Manage and track your team projects.
                    </p>
                </div>

                {canCreateProject && (
                    <button
                        type="button"
                        className="create-project-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? (
                            <>
                                <X size={18} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Create Project
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="projects-error">
                    <CircleAlert size={19} />

                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* CREATE PROJECT FORM */}
            {showForm && canCreateProject && (
                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >
                    <div className="project-form-header">
                        <div>
                            <span className="project-form-label">
                                New Project
                            </span>

                            <h2>Create New Project</h2>

                            <p>
                                Add a new project to your workspace.
                            </p>
                        </div>

                        <div className="project-form-icon">
                            <FolderKanban size={24} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Project Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter project description"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>

                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Due Date</label>

                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                    </div>

                    <div className="project-form-actions">
                        <button
                            type="button"
                            className="cancel-project-btn"
                            onClick={() => {
                                resetForm();
                                setShowForm(false);
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-project-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={17} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={17} />
                                    Create Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* PROJECT SUMMARY */}
            {!showForm && projects.length > 0 && (
                <div className="projects-summary">
                    <div>
                        <strong>{projects.length}</strong>

                        <span>
                            {projects.length === 1
                                ? " Project"
                                : " Projects"}
                        </span>
                    </div>

                    <span>Your workspace projects</span>
                </div>
            )}

            {/* PROJECT LIST */}
            {projects.length === 0 ? (
                <div className="empty-projects">
                    <div className="empty-projects-icon">
                        <FolderKanban size={34} />
                    </div>

                    <h3>No projects found</h3>

                    <p>
                        {canCreateProject
                            ? "Create your first project to get started."
                            : "There are no projects available yet."}
                    </p>

                    {canCreateProject && !showForm && (
                        <button
                            type="button"
                            className="empty-create-project-btn"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={18} />
                            Create Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <article
                            className="project-card"
                            key={project.id}
                        >
                            {/* CARD HEADER */}
                            <div className="project-card-top">
                                <div className="project-card-title">
                                    <div className="project-card-icon">
                                        <FolderKanban size={23} />
                                    </div>

                                    <div>
                                        <h2>{project.name}</h2>

                                        <span className="project-id">
                                            Project #{project.id}
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={getStatusClass(
                                        project.status
                                    )}
                                >
                                    {formatStatus(project.status)}
                                </span>
                            </div>

                            {/* DESCRIPTION */}
                            <p className="project-description">
                                {project.description ||
                                    "No description available."}
                            </p>

                            {/* PROJECT INFO */}
                            <div className="project-info">
                                <div>
                                    <span>
                                        <CalendarDays size={15} />
                                        Start Date
                                    </span>

                                    <strong>
                                        {formatDate(project.start_date)}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <Clock3 size={15} />
                                        Due Date
                                    </span>

                                    <strong>
                                        {formatDate(project.due_date)}
                                    </strong>
                                </div>
                            </div>

                            {/* VIEW BUTTON */}
                            <button
                                type="button"
                                className="view-project-btn"
                                onClick={() =>
                                    navigate(`/projects/${project.id}`)
                                }
                            >
                                View Project
                                <ArrowRight size={17} />
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Projects;
