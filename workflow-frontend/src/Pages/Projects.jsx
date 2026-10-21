import { useEffect, useState } from "react";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";

function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        start_date: "",
        due_date: "",
        status: "PLANNING",
    });

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await API.get("projects/");

            const projectData = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setProjects(projectData);
        } catch (error) {
            console.error(error.response?.data || error.message);
            setError("Unable to load projects.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await API.post("projects/", formData);

            alert("Project created successfully!");

            setFormData({
                name: "",
                description: "",
                start_date: "",
                due_date: "",
                status: "PLANNING",
            });

            setShowForm(false);

            fetchProjects();

        } catch (error) {
            console.error(error.response?.data || error.message);

            setError(
                error.response?.data?.detail ||
                "Unable to create project."
            );
        }
    };

    return (
        <div className="projects-page">

            <div className="projects-header">
                <div>
                    <h1>Projects</h1>
                    <p>Manage and track your team projects.</p>
                </div>

                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                    <button
                        className="create-project-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "+ Create Project"}
                    </button>
                )}
            </div>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {showForm && (
                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >

                    <h2>Create New Project</h2>

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

                    <button
                        type="submit"
                        className="save-project-btn"
                    >
                        Create Project
                    </button>

                </form>
            )}

            {projects.length === 0 ? (
                <div className="empty-projects">
                    <h3>No projects found</h3>
                    <p>Create a project to get started.</p>
                </div>
            ) : (
                <div className="projects-grid">

                    {projects.map((project) => (
                        <div
                            className="project-card"
                            key={project.id}
                        >

                            <div className="project-card-top">

                                <h2>{project.name}</h2>

                                <span
                                    className={`project-status ${project.status?.toLowerCase()}`}
                                >
                                    {project.status}
                                </span>

                            </div>

                            <p className="project-description">
                                {project.description ||
                                    "No description available."}
                            </p>

                            <div className="project-info">

                                <div>
                                    <span>Start Date</span>
                                    <strong>
                                        {project.start_date || "Not set"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Due Date</span>
                                    <strong>
                                        {project.due_date || "Not set"}
                                    </strong>
                                </div>

                            </div>

                            <button
                              className="view-project-btn"
                              onClick={() => navigate(`/projects/${project.id}`)}
>
                             View Project
                            </button>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default Projects;