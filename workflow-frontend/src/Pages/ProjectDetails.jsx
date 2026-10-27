
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/Api";
import "../App.css";
function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);

    const [error, setError] = useState("");
    const [memberError, setMemberError] = useState("");

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);

    const [selectedUser, setSelectedUser] = useState("");

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        due_date: "",
        assigned_to: "",
    });

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchMembers();
        fetchUsers();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await API.get(`projects/${id}/`);
            setProject(response.data);
        } catch (err) {
            console.error(
                err.response?.data || err.message
            );

            setError("Unable to load project details.");
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await API.get(
                `tasks/?project=${id}`
            );

            const taskList = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setTasks(taskList);

        } catch (err) {
            console.error(
                err.response?.data || err.message
            );
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await API.get(
                `projects/${id}/members/`
            );

            const memberList = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setMembers(memberList);

        } catch (err) {
            console.error(
                err.response?.data || err.message
            );
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await API.get("auth/users/");

            const userList = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setUsers(userList);

        } catch (err) {
            console.error(
                "Unable to load users:",
                err.response?.data || err.message
            );
        }
    };

    const handleTaskChange = (e) => {
        setTaskData({
            ...taskData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            await API.post("tasks/", {
                project: id,
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                status: taskData.status,
                due_date: taskData.due_date || null,
                assigned_to: taskData.assigned_to || null,
            });

            alert("Task created successfully!");

            setTaskData({
                title: "",
                description: "",
                priority: "MEDIUM",
                status: "TODO",
                due_date: "",
                assigned_to: "",
            });

            setShowTaskForm(false);

            fetchTasks();

        } catch (err) {
            console.error(
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to create task."
            );
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();

        setMemberError("");

        if (!selectedUser) {
            setMemberError("Please select a user.");
            return;
        }

        try {
            await API.post(
                `projects/${id}/members/`,
                {
                    user: selectedUser,
                }
            );

            alert("Member added successfully!");

            setSelectedUser("");

            setShowMemberForm(false);

            fetchMembers();

        } catch (err) {
            console.error(
                err.response?.data || err.message
            );

            setMemberError(
                err.response?.data?.detail ||
                "Unable to add member."
            );
        }
    };

    const getMemberId = (member) => {
        return member.user?.id || member.user || member.id;
    };

    const getMemberName = (member) => {
        return (
            member.username ||
            member.user?.username ||
            member.name ||
            `User ${getMemberId(member)}`
        );
    };

    if (!project) {
        return (
            <div className="project-details-page">
                <p>Loading project details...</p>
            </div>
        );
    }

    return (
        <div className="project-details-page">

            <button
                className="back-btn"
                onClick={() => navigate("/projects")}
            >
                ← Back to Projects
            </button>

            {/* PROJECT HEADER */}

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
                    {project.status?.replace("_", " ")}
                </span>

            </div>

            {/* PROJECT INFO */}

            <div className="project-details-grid">

                <div className="detail-box">

                    <span>
                        Start Date
                    </span>

                    <strong>
                        {project.start_date || "Not set"}
                    </strong>

                </div>

                <div className="detail-box">

                    <span>
                        Due Date
                    </span>

                    <strong>
                        {project.due_date || "Not set"}
                    </strong>

                </div>

                <div className="detail-box">

                    <span>
                        Project ID
                    </span>

                    <strong>
                        #{project.id}
                    </strong>

                </div>

            </div>

            {/* TASK SECTION */}

            <div className="project-section">

                <div className="section-header">

                    <h2>
                        Project Tasks
                    </h2>

                    <button
                        className="add-task-btn"
                        onClick={() =>
                            setShowTaskForm(!showTaskForm)
                        }
                    >
                        {showTaskForm
                            ? "Cancel"
                            : "+ Add Task"}
                    </button>

                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {/* TASK FORM */}

                {showTaskForm && (

                    <form
                        className="task-form"
                        onSubmit={handleTaskSubmit}
                    >

                        <h3>
                            Create New Task
                        </h3>

                        <div className="form-group">

                            <label>
                                Task Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={taskData.title}
                                onChange={handleTaskChange}
                                placeholder="Enter task title"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={taskData.description}
                                onChange={handleTaskChange}
                                placeholder="Enter task description"
                                rows="4"
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={taskData.priority}
                                    onChange={handleTaskChange}
                                >

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

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={taskData.status}
                                    onChange={handleTaskChange}
                                >

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

                        </div>

                        {/* ASSIGN TASK */}

                        <div className="form-group">

                            <label>
                                Assign To
                            </label>

                            <select
                                name="assigned_to"
                                value={taskData.assigned_to}
                                onChange={handleTaskChange}
                            >

                                <option value="">
                                    Unassigned
                                </option>

                                {members.map((member) => {

                                    const memberId =
                                        member.user?.id ||
                                        member.user ||
                                        member.id;

                                    const memberName =
                                        member.username ||
                                        member.user?.username ||
                                        member.name ||
                                        `User ${memberId}`;

                                    return (
                                        <option
                                            key={memberId}
                                            value={memberId}
                                        >
                                            {memberName}
                                        </option>
                                    );
                                })}

                            </select>

                        </div>

                        {/* DUE DATE */}

                        <div className="form-group">

                            <label>
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="due_date"
                                value={taskData.due_date}
                                onChange={handleTaskChange}
                            />

                        </div>

                        <button
                            type="submit"
                            className="save-task-btn"
                        >
                            Create Task
                        </button>

                    </form>
                )}

               {/* TASK LIST */}

{tasks.length === 0 ? (

    <div className="empty-section">

        <h3>
            No tasks yet
        </h3>

        <p>
            Add tasks to start managing
            this project.
        </p>

    </div>

) : (

    <div className="tasks-list">

        {tasks.map((task) => (

            <div
                className="task-item"
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
            >

                <div>

                    <h3>
                        {task.title}
                    </h3>

                    <p>
                        {task.description ||
                            "No description"}
                    </p>

                    <p>
                        Assigned to:{" "}

                        {task.assigned_to_username ||
                            task.assigned_to?.username ||
                            "Unassigned"}
                    </p>

                </div>

                <div className="task-meta">

                    <span>
                        {task.priority}
                    </span>

                    <span>
                        {task.status}
                    </span>

                </div>

            </div>

        ))}

    </div>

)}

                {/* ADD MEMBER FORM */}

                {showMemberForm && (

                    <form
                        className="task-form"
                        onSubmit={handleAddMember}
                    >

                        <h3>
                            Add Team Member
                        </h3>

                        <div className="form-group">

                            <label>
                                Select User
                            </label>

                            <select
                                value={selectedUser}
                                onChange={(e) =>
                                    setSelectedUser(e.target.value)
                                }
                                required
                            >

                                <option value="">
                                    Select a user
                                </option>

                                {users.map((user) => {

                                    const alreadyMember =
                                        members.some(
                                            (member) =>
                                                String(
                                                    getMemberId(member)
                                                ) ===
                                                String(user.id)
                                        );

                                    if (alreadyMember) {
                                        return null;
                                    }

                                    return (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.username}
                                        </option>
                                    );
                                })}

                            </select>

                        </div>

                        {memberError && (
                            <p className="error-message">
                                {memberError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="save-task-btn"
                        >
                            Add Member
                        </button>

                    </form>
                )}

                {/* MEMBER LIST */}

                {members.length === 0 ? (

                    <div className="empty-section">

                        <h3>
                            No team members
                        </h3>

                        <p>
                            Add members to collaborate
                            on this project.
                        </p>

                    </div>

                ) : (

                    <div className="tasks-list">

                        {members.map((member) => {

                            const memberId =
                                getMemberId(member);

                            const memberName =
                                getMemberName(member);

                            return (
                                <div
                                    className="task-item"
                                    key={memberId}
                                >

                                    <div>

                                        <h3>
                                            {memberName}
                                        </h3>

                                        <p>
                                            Team Member
                                        </p>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

            </div>

        </div>
    );
}

export default ProjectDetails;
