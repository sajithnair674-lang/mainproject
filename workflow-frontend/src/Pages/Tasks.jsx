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

                            </tr>

                        </thead>


                        <tbody>

                            {tasks.map((task) => (

                                <tr key={task.id}>

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


                                    <td>
                                        {getProjectName(task)}
                                    </td>


                                    <td>
                                        {getAssignedUser(task)}
                                    </td>


                                    <td>

                                        <span className="task-badge">

                                            {task.priority}

                                        </span>

                                    </td>


                                    <td>

                                        <span className="task-badge">

                                            {task.status}

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