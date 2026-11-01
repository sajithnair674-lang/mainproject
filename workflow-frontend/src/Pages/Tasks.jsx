import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";

function Tasks() {

    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [search, setSearch] = useState("");


    const fetchTasks = async () => {

        try {

            setLoading(true);
            setError("");

            let url = "tasks/?";

            if (status) {
                url += `status=${status}&`;
            }

            if (priority) {
                url += `priority=${priority}&`;
            }

            if (search) {
                url += `search=${encodeURIComponent(search)}&`;
            }

            const response = await API.get(url);

            const data = response.data;

            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                setTasks(data.results || []);
            }

        } catch (err) {

            console.error(
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load tasks."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchTasks();

    }, [status, priority, search]);


    const getAssignedUser = (task) => {

        return (
            task.assigned_to_username ||
            task.assigned_to?.username ||
            "Unassigned"
        );

    };


    const getProjectName = (task) => {

        return (
            task.project_name ||
            task.project?.name ||
            `Project #${task.project || "-"}`
        );

    };


    const formatStatus = (value) => {

        if (!value) {
            return "-";
        }

        return value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );

    };


    const formatPriority = (value) => {

        if (!value) {
            return "-";
        }

        return value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );

    };


    const getStatusClass = (value) => {

        switch (value) {

            case "TODO":
                return "task-status todo";

            case "IN_PROGRESS":
                return "task-status in-progress";

            case "IN_REVIEW":
                return "task-status in-review";

            case "COMPLETED":
                return "task-status completed";

            case "BLOCKED":
                return "task-status blocked";

            default:
                return "task-status";

        }

    };


    const getPriorityClass = (value) => {

        switch (value) {

            case "LOW":
                return "task-priority low";

            case "MEDIUM":
                return "task-priority medium";

            case "HIGH":
                return "task-priority high";

            case "URGENT":
                return "task-priority urgent";

            default:
                return "task-priority";

        }

    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    return (

        <div className="tasks-page">

            {/* HEADER */}

            <div className="tasks-header">

                <div>

                    <h1>
                        Tasks
                    </h1>

                    <p>
                        Manage and track your team tasks.
                    </p>

                </div>

            </div>


            {/* FILTERS */}

            <div className="task-filters">

                <div className="task-filter-group">

                    <label>
                        Search
                    </label>

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="task-filter-group">

                    <label>
                        Status
                    </label>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="TODO">
                            To Do
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="IN_REVIEW">
                            In Review
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="BLOCKED">
                            Blocked
                        </option>

                    </select>

                </div>


                <div className="task-filter-group">

                    <label>
                        Priority
                    </label>

                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value)
                        }
                    >

                        <option value="">
                            All Priority
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="URGENT">
                            Urgent
                        </option>

                    </select>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <p className="message error-message">
                    {error}
                </p>

            )}


            {/* LOADING */}

            {loading ? (

                <div className="empty-section">

                    <p>
                        Loading tasks...
                    </p>

                </div>

            ) : tasks.length === 0 ? (

                <div className="empty-section">

                    <h2>
                        No tasks found
                    </h2>

                    <p>
                        There are no tasks matching your filters.
                    </p>

                </div>

            ) : (

                /* TASK TABLE */

                <div className="tasks-table-wrapper">

                    <table className="tasks-table">

                        <thead>

                            <tr>

                                <th>
                                    Task
                                </th>

                                <th>
                                    Project
                                </th>

                                <th>
                                    Assigned To
                                </th>

                                <th>
                                    Priority
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Due Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {tasks.map((task) => (

                                <tr key={task.id}>

                                    {/* TASK */}

                                    <td>

                                        <button
                                            className="task-title-button"
                                            onClick={() =>
                                                navigate(
                                                    `/tasks/${task.id}`
                                                )
                                            }
                                        >
                                            {task.title}
                                        </button>

                                        {task.description && (

                                            <div className="task-description">

                                                {task.description}

                                            </div>

                                        )}

                                    </td>


                                    {/* PROJECT */}

                                    <td>

                                        <span className="task-project-name">
                                            {getProjectName(task)}
                                        </span>

                                    </td>


                                    {/* ASSIGNED USER */}

                                    <td>

                                        <span className="task-assignee">
                                            {getAssignedUser(task)}
                                        </span>

                                    </td>


                                    {/* PRIORITY */}

                                    <td>

                                        <span
                                            className={getPriorityClass(
                                                task.priority
                                            )}
                                        >
                                            {formatPriority(
                                                task.priority
                                            )}
                                        </span>

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={getStatusClass(
                                                task.status
                                            )}
                                        >
                                            {formatStatus(
                                                task.status
                                            )}
                                        </span>

                                    </td>


                                    {/* DUE DATE */}

                                    <td>

                                        <span className="task-due-date">
                                            {formatDate(
                                                task.due_date
                                            )}
                                        </span>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );
}

export default Tasks;