import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/Api";

function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await API.get(`../projects/${id}/`);
            setProject(response.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            setError("Unable to load project.");
        }
    };

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!project) {
        return <p>Loading project...</p>;
    }

    return (
        <div className="project-details-page">

            <button
                className="back-btn"
                onClick={() => navigate("/projects")}
            >
                ← Back to Projects
            </button>

            <div className="project-details-header">

                <div>
                    <h1>{project.name}</h1>

                    <p>
                        {project.description ||
                            "No description available."}
                    </p>
                </div>

                <span
                    className={`project-status ${project.status?.toLowerCase()}`}
                >
                    {project.status}
                </span>

            </div>

            <div className="project-details-grid">

                <div className="detail-box">
                    <span>Start Date</span>
                    <strong>
                        {project.start_date || "Not set"}
                    </strong>
                </div>

                <div className="detail-box">
                    <span>Due Date</span>
                    <strong>
                        {project.due_date || "Not set"}
                    </strong>
                </div>

                <div className="detail-box">
                    <span>Created By</span>
                    <strong>
                        {project.created_by_username ||
                            project.created_by ||
                            "Unknown"}
                    </strong>
                </div>

            </div>

            <div className="project-section">

                <div className="section-header">
                    <h2>Project Tasks</h2>

                    <button className="add-task-btn">
                        + Add Task
                    </button>
                </div>

                <div className="empty-section">
                    <h3>No tasks yet</h3>
                    <p>
                        Add tasks to start managing this project.
                    </p>
                </div>

            </div>

            <div className="project-section">

                <div className="section-header">
                    <h2>Team Members</h2>

                    <button className="add-member-btn">
                        + Add Member
                    </button>
                </div>

                <div className="empty-section">
                    <h3>No team members</h3>
                    <p>
                        Add members to collaborate on this project.
                    </p>
                </div>

            </div>

        </div>
    );
}

export default ProjectDetails;