
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FolderKanban,
    ArrowLeft,
    ArrowRight,
    Plus,
    X,
    CalendarDays,
    Clock3,
    ListChecks,
    Users,
    CircleAlert,
    RefreshCw,
    UserRound,
    CheckCircle2,
    Circle,
    Timer,
    Eye,
    Ban,
    TrendingUp,
} from "lucide-react";

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

    const [taskSaving, setTaskSaving] = useState(false);
    const [memberSaving, setMemberSaving] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const canCreateTask = user?.role !== "GUEST";

    const canAddMember =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

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

        if (canAddMember) {
            fetchUsers();
        }
    }, [id]);

    // FETCH PROJECT
    const fetchProject = async () => {
        try {
            const response = await API.get(`projects/${id}/`);
            setProject(response.data);
            setError("");
        } catch (err) {
            console.error(
                "Project error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load project details."
            );
        }
    };

    // FETCH PROJECT TASKS
    const fetchTasks = async () => {
        try {
            const response = await API.get(`tasks/?project=${id}`);

            const data = response.data;

            const taskList = Array.isArray(data)
                ? data
                : data.results || [];

            setTasks(taskList);
        } catch (err) {
            console.error(
                "Tasks error:",
                err.response?.data || err.message
            );
        }
    };

    // FETCH PROJECT MEMBERS
    const fetchMembers = async () => {
        try {
            const response = await API.get(
                `projects/${id}/members/`
            );

            const data = response.data;

            let memberList = [];

            if (Array.isArray(data)) {
                memberList = data;
            } else if (Array.isArray(data.results)) {
                memberList = data.results;
            } else if (Array.isArray(data.members)) {
                memberList = data.members;
            }

            setMembers(memberList);
        } catch (err) {
            console.error(
                "Members error:",
                err.response?.data || err.message
            );
        }
    };

    // FETCH USERS - ADMIN AND MANAGER ONLY
    const fetchUsers = async () => {
        if (!canAddMember) return;

        setUsersLoading(true);
        setMemberError("");

        try {
            const response = await API.get("users/");

            const data = response.data;

            let userList = [];

            if (Array.isArray(data)) {
                userList = data;
            } else if (Array.isArray(data.results)) {
                userList = data.results;
            } else if (Array.isArray(data.users)) {
                userList = data.users;
            }

            setUsers(userList);
        } catch (err) {
            console.error(
                "Users error:",
                err.response?.data || err.message
            );

            setUsers([]);

            setMemberError(
                err.response?.data?.detail ||
                "Unable to load registered users."
            );
        } finally {
            setUsersLoading(false);
        }
    };

    // TASK FORM INPUT
    const handleTaskChange = (e) => {
        setTaskData({
            ...taskData,
            [e.target.name]: e.target.value,
        });
    };

    // RESET TASK FORM
    const resetTaskForm = () => {
        setTaskData({
            title: "",
            description: "",
            priority: "MEDIUM",
            status: "TODO",
            due_date: "",
            assigned_to: "",
        });
    };

    // CREATE TASK
    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        if (!canCreateTask) return;

        setError("");
        setTaskSaving(true);

        try {
            await API.post("tasks/", {
                project: Number(id),
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                status: taskData.status,
                due_date: taskData.due_date || null,
                assigned_to: taskData.assigned_to
                    ? Number(taskData.assigned_to)
                    : null,
            });

            resetTaskForm();
            setShowTaskForm(false);

            await fetchTasks();
        } catch (err) {
            console.error(
                "Create task error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to create task."
            );
        } finally {
            setTaskSaving(false);
        }
    };

    // ADD PROJECT MEMBER
    const handleAddMember = async (e) => {
        e.preventDefault();

        if (!canAddMember) return;

        setMemberError("");

        if (!selectedUser) {
            setMemberError("Please select a user.");
            return;
        }

        setMemberSaving(true);

        try {
            await API.post(
                `projects/${id}/members/`,
                {
                    user: Number(selectedUser),
                }
            );

            setSelectedUser("");
            setShowMemberForm(false);

            await fetchMembers();
        } catch (err) {
            console.error(
                "Add member error:",
                err.response?.data || err.message
            );

            setMemberError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to add member."
            );
        } finally {
            setMemberSaving(false);
        }
    };

    // MEMBER ID
    const getMemberId = (member) => {
        return (
            member.user?.id ||
            member.user_id ||
            member.user ||
            member.id
        );
    };

    // MEMBER NAME
    const getMemberName = (member) => {
        return (
            member.username ||
            member.user?.username ||
            member.user?.name ||
            member.name ||
            member.user_name ||
            `User ${getMemberId(member)}`
        );
    };

    // USER NAME
    const getUserName = (user) => {
        return (
            user.username ||
            user.name ||
            user.email ||
            `User ${user.id}`
        );
    };

    // TASK ASSIGNEE
    const getTaskAssignee = (task) => {
        return (
            task.assigned_to_username ||
            task.assigned_to?.username ||
            task.assigned_to?.name ||
            "Unassigned"
        );
    };

    // FORMAT STATUS
    const formatStatus = (value) => {
        if (!value) return "-";

        return value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // FORMAT PRIORITY
    const formatPriority = (value) => {
        if (!value) return "-";

        return value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // TASK STATUS CLASS
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

    // TASK PRIORITY CLASS
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

    // PROJECT STATUS CLASS
    const getProjectStatusClass = (value) => {
        switch (value) {
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

    // FORMAT DATE
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

    // AVAILABLE USERS
    const availableUsers = users.filter((user) => {
        const alreadyMember = members.some(
            (member) =>
                String(getMemberId(member)) === String(user.id)
        );

        return !alreadyMember;
    });

    const statusIcons = {
        TODO: Circle,
        IN_PROGRESS: Timer,
        IN_REVIEW: Eye,
        COMPLETED: CheckCircle2,
        BLOCKED: Ban,
    };

    const priorityIcons = {
        LOW: Circle,
        MEDIUM: Clock3,
        HIGH: TrendingUp,
        URGENT: CircleAlert,
    };

    // PROJECT LOADING
    if (!project) {
        return (
            <div className="project-details-page">
                {error ? (
                    <div className="project-details-error">
                        <div className="project-details-error-icon">
                            <CircleAlert size={30} />
                        </div>

                        <h2>Unable to load project</h2>

                        <p>{error}</p>

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => navigate("/projects")}
                        >
                            <ArrowLeft size={17} />
                            Back to Projects
                        </button>
                    </div>
                ) : (
                    <div className="project-details-loading">
                        <div className="project-details-loading-icon">
                            <FolderKanban size={30} />
                        </div>

                        <h3>Loading project...</h3>

                        <p>
                            Please wait while we load the project details.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="project-details-page">

            {/* BACK BUTTON */}
            <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/projects")}
            >
                <ArrowLeft size={17} />
                Back to Projects
            </button>

            {/* PROJECT HEADER */}
            <div className="project-details-header">
                <div className="project-details-heading">
                    <span className="task-page-label">
                        Project Details
                    </span>

                    <div className="project-details-title-row">
                        <div className="project-details-icon">
                            <FolderKanban size={27} />
                        </div>

                        <div>
                            <h1>{project.name}</h1>

                            <span className="project-details-id">
                                Project #{project.id}
                            </span>
                        </div>
                    </div>

                    <p>
                        {project.description ||
                            "No description available."}
                    </p>
                </div>

                <span className={getProjectStatusClass(project.status)}>
                    {formatStatus(project.status)}
                </span>
            </div>

            {/* PROJECT INFORMATION */}
            <div className="project-details-grid">
                <div className="detail-box">
                    <span>
                        <CalendarDays size={16} />
                        Start Date
                    </span>

                    <strong>
                        {formatDate(project.start_date)}
                    </strong>
                </div>

                <div className="detail-box">
                    <span>
                        <Clock3 size={16} />
                        Due Date
                    </span>

                    <strong>
                        {formatDate(project.due_date)}
                    </strong>
                </div>

                <div className="detail-box">
                    <span>
                        <FolderKanban size={16} />
                        Project ID
                    </span>

                    <strong>#{project.id}</strong>
                </div>

                <div className="detail-box">
                    <span>
                        <ListChecks size={16} />
                        Tasks
                    </span>

                    <strong>{tasks.length}</strong>
                </div>
            </div>

            {/* PROJECT TASKS */}
            <div className="project-section">
                <div className="section-header">
                    <div>
                        <span className="section-label">
                            Workspace
                        </span>

                        <h2>Project Tasks</h2>

                        <p>
                            {tasks.length} task
                            {tasks.length !== 1 ? "s" : ""} in this project
                        </p>
                    </div>

                    {canCreateTask && (
                        <button
                            type="button"
                            className="add-task-btn"
                            onClick={() => setShowTaskForm(!showTaskForm)}
                        >
                            {showTaskForm ? (
                                <>
                                    <X size={17} />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Plus size={17} />
                                    Add Task
                                </>
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="projects-error">
                        <CircleAlert size={18} />
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* CREATE TASK FORM */}
                {showTaskForm && canCreateTask && (
                    <form
                        className="task-form project-task-form"
                        onSubmit={handleTaskSubmit}
                    >
                        <div className="project-form-header">
                            <div>
                                <span className="project-form-label">
                                    New Task
                                </span>

                                <h2>Create New Task</h2>

                                <p>
                                    Add a task and assign it to a project member.
                                </p>
                            </div>

                            <div className="project-form-icon">
                                <ListChecks size={24} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Task Title</label>

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
                            <label>Description</label>

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
                                <label>Priority</label>

                                <select
                                    name="priority"
                                    value={taskData.priority}
                                    onChange={handleTaskChange}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>

                                <select
                                    name="status"
                                    value={taskData.status}
                                    onChange={handleTaskChange}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="BLOCKED">Blocked</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Assign To</label>

                            <select
                                name="assigned_to"
                                value={taskData.assigned_to}
                                onChange={handleTaskChange}
                            >
                                <option value="">Unassigned</option>

                                {members.map((member) => {
                                    const memberId = getMemberId(member);

                                    return (
                                        <option
                                            key={memberId}
                                            value={memberId}
                                        >
                                            {getMemberName(member)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Due Date</label>

                            <input
                                type="date"
                                name="due_date"
                                value={taskData.due_date}
                                onChange={handleTaskChange}
                            />
                        </div>

                        <div className="project-form-actions">
                            <button
                                type="button"
                                className="cancel-project-btn"
                                onClick={() => {
                                    resetTaskForm();
                                    setShowTaskForm(false);
                                }}
                                disabled={taskSaving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-task-btn"
                                disabled={taskSaving}
                            >
                                {taskSaving ? (
                                    <>
                                        <RefreshCw size={16} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={17} />
                                        Create Task
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* TASK LIST */}
                {tasks.length === 0 ? (
                    <div className="empty-section project-empty-state">
                        <div className="project-empty-icon">
                            <ListChecks size={30} />
                        </div>

                        <h3>No tasks yet</h3>

                        <p>
                            {canCreateTask
                                ? "Add tasks to start managing this project."
                                : "There are no tasks available in this project."}
                        </p>

                        {canCreateTask && !showTaskForm && (
                            <button
                                type="button"
                                className="empty-create-project-btn"
                                onClick={() => setShowTaskForm(true)}
                            >
                                <Plus size={17} />
                                Add First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="tasks-list">
                        {tasks.map((task) => {
                            const StatusIcon =
                                statusIcons[task.status] || Circle;

                            const PriorityIcon =
                                priorityIcons[task.priority] || Circle;

                            return (
                                <button
                                    type="button"
                                    className="task-item project-task-item"
                                    key={task.id}
                                    onClick={() =>
                                        navigate(`/tasks/${task.id}`)
                                    }
                                >
                                    <div className="task-item-main">
                                        <div className="project-task-title-row">
                                            <div className="project-task-icon">
                                                <ListChecks size={20} />
                                            </div>

                                            <div>
                                                <h3>{task.title}</h3>

                                                <p>
                                                    {task.description ||
                                                        "No description"}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="task-assignee">
                                            <UserRound size={14} />
                                            Assigned to: {getTaskAssignee(task)}
                                        </span>
                                    </div>

                                    <div className="task-meta">
                                        <span className={getPriorityClass(task.priority)}>
                                            <PriorityIcon size={14} />
                                            {formatPriority(task.priority)}
                                        </span>

                                        <span className={getStatusClass(task.status)}>
                                            <StatusIcon size={14} />
                                            {formatStatus(task.status)}
                                        </span>

                                        {task.due_date && (
                                            <span className="task-due-date">
                                                {formatDate(task.due_date)}
                                            </span>
                                        )}

                                        <ArrowRight
                                            size={18}
                                            className="project-task-arrow"
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* TEAM MEMBERS */}
            <div className="project-section">
                <div className="section-header">
                    <div>
                        <span className="section-label">
                            Collaboration
                        </span>

                        <h2>Team Members</h2>

                        <p>
                            {members.length} member
                            {members.length !== 1 ? "s" : ""} working on this project
                        </p>
                    </div>

                    {canAddMember && (
                        <button
                            type="button"
                            className="add-task-btn"
                            onClick={() => {
                                setMemberError("");
                                setSelectedUser("");
                                setShowMemberForm(!showMemberForm);
                            }}
                        >
                            {showMemberForm ? (
                                <>
                                    <X size={17} />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Plus size={17} />
                                    Add Member
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* ADD MEMBER FORM */}
                {showMemberForm && canAddMember && (
                    <form
                        className="task-form project-member-form"
                        onSubmit={handleAddMember}
                    >
                        <div className="project-form-header">
                            <div>
                                <span className="project-form-label">
                                    Team
                                </span>

                                <h2>Add Team Member</h2>

                                <p>
                                    Add a registered user to collaborate on this project.
                                </p>
                            </div>

                            <div className="project-form-icon">
                                <Users size={24} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select User</label>

                            <select
                                value={selectedUser}
                                onChange={(e) => {
                                    setSelectedUser(e.target.value);
                                    setMemberError("");
                                }}
                                required
                                disabled={usersLoading}
                            >
                                <option value="">
                                    {usersLoading
                                        ? "Loading users..."
                                        : "Select a user"}
                                </option>

                                {availableUsers.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {getUserName(user)}
                                    </option>
                                ))}
                            </select>

                            {usersLoading && (
                                <small>
                                    Loading registered users...
                                </small>
                            )}

                            {!usersLoading && users.length === 0 && (
                                <small>
                                    No users were returned. Check the users API.
                                </small>
                            )}

                            {users.length > 0 &&
                                availableUsers.length === 0 && (
                                    <small>
                                        All registered users are already members.
                                    </small>
                                )}
                        </div>

                        {memberError && (
                            <p className="error-message">
                                {memberError}
                            </p>
                        )}

                        <div className="project-form-actions">
                            <button
                                type="button"
                                className="cancel-project-btn"
                                onClick={() => {
                                    setSelectedUser("");
                                    setMemberError("");
                                    setShowMemberForm(false);
                                }}
                                disabled={memberSaving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-task-btn"
                                disabled={
                                    memberSaving ||
                                    usersLoading ||
                                    !selectedUser
                                }
                            >
                                {memberSaving ? (
                                    "Adding..."
                                ) : (
                                    <>
                                        <Plus size={17} />
                                        Add Member
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* MEMBER LIST */}
                {members.length === 0 ? (
                    <div className="empty-section project-empty-state">
                        <div className="project-empty-icon">
                            <Users size={30} />
                        </div>

                        <h3>No team members</h3>

                        <p>
                            {canAddMember
                                ? "Add members to collaborate on this project."
                                : "No team members are available to display."}
                        </p>

                        {canAddMember && !showMemberForm && (
                            <button
                                type="button"
                                className="empty-create-project-btn"
                                onClick={() => {
                                    setMemberError("");
                                    setSelectedUser("");
                                    setShowMemberForm(true);
                                }}
                            >
                                <Plus size={17} />
                                Add First Member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="project-members-list">
                        {members.map((member) => {
                            const memberId = getMemberId(member);
                            const memberName = getMemberName(member);

                            return (
                                <div
                                    className="project-member-card"
                                    key={memberId}
                                >
                                    <div className="project-member-avatar">
                                        {memberName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="project-member-info">
                                        <h3>{memberName}</h3>
                                        <p>Team Member</p>
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
