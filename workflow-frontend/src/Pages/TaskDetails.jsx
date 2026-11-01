
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Trash2,
    CalendarDays,
    Clock3,
    MessageCircle,
    Paperclip,
    Upload,
    FileText,
    ExternalLink,
    FolderKanban,
    CheckCircle2,
    Circle,
    Timer,
    Eye,
    Ban,
    Pencil,
    UserRound,
    History,
    AlertCircle,
    RefreshCw,
    Send,
    ListChecks,
} from "lucide-react";

import API from "../services/Api";
import "../App.css";

function TaskDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isGuest = user?.role === "GUEST";

    const [task, setTask] = useState(null);
    const [members, setMembers] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [attachments, setAttachments] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [attachmentLoading, setAttachmentLoading] = useState(false);

    const [error, setError] = useState("");
    const [commentError, setCommentError] = useState("");
    const [attachmentError, setAttachmentError] = useState("");

    const [commentText, setCommentText] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        assigned_to: "",
        due_date: "",
    });

    // FETCH TASK
    const fetchTask = async () => {
        try {
            const response = await API.get(`tasks/${id}/`);
            const data = response.data;

            setTask(data);

            setFormData({
                title: data.title || "",
                description: data.description || "",
                priority: data.priority || "MEDIUM",
                status: data.status || "TODO",
                assigned_to:
                    data.assigned_to?.id ||
                    data.assigned_to ||
                    "",
                due_date: data.due_date
                    ? data.due_date.split("T")[0]
                    : "",
            });
        } catch (err) {
            console.error("Task error:", err.response?.data || err.message);

            setError(
                err.response?.data?.detail ||
                "Unable to load task details."
            );
        } finally {
            setLoading(false);
        }
    };

    // FETCH PROJECT MEMBERS
    const fetchMembers = async (projectId) => {
        try {
            if (!projectId) return;

            const response = await API.get(
                `projects/${projectId}/members/`
            );

            const data = response.data;

            setMembers(
                Array.isArray(data)
                    ? data
                    : data.results || data.members || []
            );
        } catch (err) {
            console.error("Members error:", err.response?.data || err.message);
        }
    };

    // FETCH COMMENTS
    const fetchComments = async () => {
        try {
            const response = await API.get(`tasks/${id}/comments/`);
            const data = response.data;

            setComments(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

            setCommentError("");
        } catch (err) {
            console.error("Comments error:", err.response?.data || err.message);
            setCommentError("Unable to load comments.");
        }
    };

    // FETCH ACTIVITIES
    const fetchActivities = async () => {
        try {
            const response = await API.get(
                `tasks/activities/?task=${id}`
            );

            const data = response.data;

            setActivities(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Activities error:", err.response?.data || err.message);
        }
    };

    // FETCH ATTACHMENTS
    const fetchAttachments = async () => {
        try {
            const response = await API.get(`tasks/${id}/attachments/`);
            const data = response.data;

            setAttachments(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

            setAttachmentError("");
        } catch (err) {
            console.error("Attachments error:", err.response?.data || err.message);
            setAttachmentError("Unable to load attachments.");
        }
    };

    // INITIAL DATA
    useEffect(() => {
        setLoading(true);

        fetchTask();
        fetchComments();
        fetchActivities();
        fetchAttachments();
    }, [id]);

    // LOAD MEMBERS AFTER TASK
    useEffect(() => {
        if (!task) return;

        const projectId = task.project?.id || task.project;
        fetchMembers(projectId);
    }, [task]);

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // UPDATE TASK
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isGuest) return;

        setSaving(true);
        setError("");

        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                assigned_to: formData.assigned_to
                    ? Number(formData.assigned_to)
                    : null,
                due_date: formData.due_date || null,
            };

            await API.put(`tasks/${id}/`, updateData);

            await fetchTask();
            await fetchActivities();

            setError("");
        } catch (err) {
            console.error("Update task error:", err.response?.data || err.message);

            const errorData = err.response?.data;

            setError(
                errorData?.detail ||
                (errorData
                    ? JSON.stringify(errorData)
                    : "Unable to update task.")
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE TASK
    const handleDeleteTask = async () => {
        if (isGuest) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        setDeleting(true);
        setError("");

        try {
            await API.delete(`tasks/${id}/`);
            navigate(-1);
        } catch (err) {
            console.error("Delete task error:", err.response?.data || err.message);

            setError(
                err.response?.data?.detail ||
                "Unable to delete task."
            );

            setDeleting(false);
        }
    };

    // ADD COMMENT
    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (isGuest) return;

        if (!commentText.trim()) {
            setCommentError("Please enter a comment.");
            return;
        }

        setCommentLoading(true);
        setCommentError("");

        try {
            await API.post(`tasks/${id}/comments/`, {
                comment: commentText.trim(),
            });

            setCommentText("");

            await fetchComments();
            await fetchActivities();
        } catch (err) {
            console.error("Comment error:", err.response?.data || err.message);

            setCommentError(
                err.response?.data?.detail ||
                "Unable to add comment."
            );
        } finally {
            setCommentLoading(false);
        }
    };

    // UPLOAD ATTACHMENT
    const handleAttachmentUpload = async (e) => {
        e.preventDefault();

        if (isGuest) return;

        if (!selectedFile) {
            setAttachmentError("Please select a file.");
            return;
        }

        setAttachmentLoading(true);
        setAttachmentError("");

        try {
            const uploadData = new FormData();

            uploadData.append("file", selectedFile);
            uploadData.append("file_name", selectedFile.name);

            await API.post(
                `tasks/${id}/attachments/`,
                uploadData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setSelectedFile(null);

            const fileInput = document.getElementById(
                "task-attachment-input"
            );

            if (fileInput) fileInput.value = "";

            await fetchAttachments();
            await fetchActivities();
        } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);

            setAttachmentError(
                err.response?.data?.detail ||
                "Unable to upload attachment."
            );
        } finally {
            setAttachmentLoading(false);
        }
    };

    // MEMBER ID
    const getMemberId = (member) =>
        member.user?.id ||
        member.user_id ||
        member.user ||
        member.id;

    // MEMBER NAME
    const getMemberName = (member) =>
        member.username ||
        member.user?.username ||
        member.name ||
        `User ${getMemberId(member)}`;

    // COMMENT USER
    const getCommentUser = (comment) =>
        comment.user?.username ||
        comment.username ||
        comment.user_name ||
        comment.user ||
        "User";

    // ACTIVITY USER
    const getActivityUser = (activity) =>
        activity.user?.username ||
        activity.username ||
        activity.user_name ||
        activity.user ||
        "User";

    // DATE AND TIME
    const getDateTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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

    // STATUS CLASS
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

    // PRIORITY CLASS
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

    // FORMAT DATE
    const formatDate = (date) => {
        if (!date) return "Not set";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ACTIVITY ICON
    const getActivityIcon = (action) => {
        switch (action) {
            case "PROJECT_CREATED":
                return <FolderKanban size={18} />;
            case "TASK_CREATED":
                return <CheckCircle2 size={18} />;
            case "TASK_UPDATED":
                return <Pencil size={18} />;
            case "TASK_DELETED":
                return <Trash2 size={18} />;
            case "COMMENT_ADDED":
                return <MessageCircle size={18} />;
            case "ATTACHMENT_ADDED":
                return <Paperclip size={18} />;
            default:
                return <Clock3 size={18} />;
        }
    };

    // LOADING
    if (loading) {
        return (
            <div className="task-details-page">
                <div className="task-details-loading">
                    <div className="task-details-loading-icon">
                        <RefreshCw size={26} className="spin-icon" />
                    </div>

                    <h2>Loading task...</h2>
                    <p>Please wait while we load the task details.</p>
                </div>
            </div>
        );
    }

    // TASK NOT FOUND
    if (!task) {
        return (
            <div className="task-details-page">
                <div className="task-details-error">
                    <div className="task-details-error-icon">
                        <AlertCircle size={28} />
                    </div>

                    <h2>Task not found</h2>
                    <p>{error || "Unable to load this task."}</p>

                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="task-details-page">

            {/* TOP ACTIONS */}
            <div className="task-top-actions">
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                {!isGuest && (
                    <button
                        type="button"
                        className="delete-task-btn"
                        onClick={handleDeleteTask}
                        disabled={deleting}
                    >
                        <Trash2 size={17} />
                        {deleting ? "Deleting..." : "Delete Task"}
                    </button>
                )}
            </div>

            {/* TASK HEADER */}
            <div className="task-details-header">
                <div className="task-details-heading">
                    <span className="task-page-label">
                        <ListChecks size={15} />
                        Task Details
                    </span>

                    <h1>{task.title}</h1>

                    <p>
                        {task.description || "No description available."}
                    </p>
                </div>

                <div className="task-page-status">
                    <span className={getStatusClass(task.status)}>
                        {formatStatus(task.status)}
                    </span>

                    <span className={getPriorityClass(task.priority)}>
                        {formatPriority(task.priority)}
                    </span>
                </div>
            </div>

            {error && (
                <div className="task-details-error-message">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* EDIT TASK */}
            {!isGuest ? (
                <div className="task-edit-section">
                    <div className="section-header">
                        <div>
                            <span className="section-label">
                                <Pencil size={14} /> Task Management
                            </span>

                            <h2>Edit Task</h2>
                            <p>Update the task details, assignment and status.</p>
                        </div>
                    </div>

                    <form className="task-edit-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter task description"
                                rows="5"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
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
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="BLOCKED">Blocked</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Assigned To</label>
                                <select
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                >
                                    <option value="">Unassigned</option>

                                    {members.map((member) => {
                                        const memberId = getMemberId(member);

                                        return (
                                            <option key={memberId} value={memberId}>
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
                                    value={formData.due_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="task-form-actions">
                            <button
                                type="submit"
                                className="save-task-btn"
                                disabled={saving}
                            >
                                <Save size={17} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="guest-readonly-notice">
                    <Eye size={18} />
                    <span>You are viewing this task in read-only mode.</span>
                </div>
            )}

            {/* TASK INFORMATION */}
            <div className="task-information">
                <div className="section-header">
                    <div>
                        <span className="section-label">Overview</span>
                        <h2>Task Information</h2>
                        <p>A quick overview of this task.</p>
                    </div>
                </div>

                <div className="task-information-grid">
                    <div>
                        <span>Task ID</span>
                        <strong>#{task.id}</strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>{formatStatus(task.status)}</strong>
                    </div>

                    <div>
                        <span>Priority</span>
                        <strong>{formatPriority(task.priority)}</strong>
                    </div>

                    <div>
                        <span>
                            <CalendarDays size={15} /> Due Date
                        </span>
                        <strong>{formatDate(task.due_date)}</strong>
                    </div>
                </div>
            </div>

            {/* COMMENTS */}
            <div className="task-comments-section">
                <div className="comments-header">
                    <div>
                        <span className="section-label">
                            <MessageCircle size={14} /> Team Discussion
                        </span>

                        <h2>Comments</h2>
                        <p>Discuss this task with your team.</p>
                    </div>

                    <span className="comment-count">{comments.length}</span>
                </div>

                {commentError && (
                    <p className="error-message">{commentError}</p>
                )}

                {!isGuest && (
                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows="4"
                        />

                        <div className="comment-form-footer">
                            <span>Share an update with your team</span>

                            <button type="submit" disabled={commentLoading}>
                                <Send size={16} />
                                {commentLoading ? "Posting..." : "Add Comment"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <div className="no-comments">
                            <div className="no-comments-icon">
                                <MessageCircle size={25} />
                            </div>

                            <h3>No comments yet</h3>
                            <p>Comments will appear here.</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div className="comment-card" key={comment.id}>
                                <div className="comment-avatar">
                                    {getCommentUser(comment).charAt(0).toUpperCase()}
                                </div>

                                <div className="comment-content">
                                    <div className="comment-top">
                                        <strong>{getCommentUser(comment)}</strong>

                                        <span>
                                            {getDateTime(
                                                comment.created_at ||
                                                comment.created ||
                                                comment.date
                                            )}
                                        </span>
                                    </div>

                                    <p>{comment.comment}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ACTIVITY TIMELINE */}
            <div className="task-activity-section">
                <div className="activity-header">
                    <div>
                        <span className="section-label">
                            <History size={14} /> History
                        </span>

                        <h2>Activity Timeline</h2>
                        <p>Track the recent activity on this task.</p>
                    </div>

                    <span className="activity-count">{activities.length}</span>
                </div>

                <div className="activity-timeline">
                    {activities.length === 0 ? (
                        <div className="no-activity">
                            <div className="no-activity-icon">
                                <Clock3 size={25} />
                            </div>

                            <h3>No activity yet</h3>
                            <p>Task activity will appear here.</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div className="activity-item" key={activity.id}>
                                <div className="activity-icon">
                                    {getActivityIcon(activity.action)}
                                </div>

                                <div className="activity-content">
                                    <div className="activity-top">
                                        <strong>{getActivityUser(activity)}</strong>

                                        <span>
                                            {getDateTime(
                                                activity.created_at ||
                                                activity.created ||
                                                activity.date
                                            )}
                                        </span>
                                    </div>

                                    <p>
                                        {activity.description ||
                                            activity.action ||
                                            "Activity recorded"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ATTACHMENTS */}
            <div className="task-attachments-section">
                <div className="attachments-header">
                    <div>
                        <span className="section-label">
                            <Paperclip size={14} /> Files
                        </span>

                        <h2>Attachments</h2>
                        <p>Files related to this task.</p>
                    </div>

                    <span className="attachment-count">{attachments.length}</span>
                </div>

                {attachmentError && (
                    <p className="error-message">{attachmentError}</p>
                )}

                {!isGuest && (
                    <form
                        className="attachment-upload-form"
                        onSubmit={handleAttachmentUpload}
                    >
                        <input
                            id="task-attachment-input"
                            type="file"
                            onChange={(e) =>
                                setSelectedFile(e.target.files[0] || null)
                            }
                        />

                        <button type="submit" disabled={attachmentLoading}>
                            <Upload size={17} />
                            {attachmentLoading ? "Uploading..." : "Upload File"}
                        </button>
                    </form>
                )}

                <div className="attachments-list">
                    {attachments.length === 0 ? (
                        <div className="no-attachments">
                            <div className="no-attachments-icon">
                                <Paperclip size={25} />
                            </div>

                            <h3>No attachments yet</h3>
                            <p>Task files will appear here.</p>
                        </div>
                    ) : (
                        attachments.map((attachment) => (
                            <div className="attachment-card" key={attachment.id}>
                                <div className="attachment-icon">
                                    <FileText size={22} />
                                </div>

                                <div className="attachment-info">
                                    <strong>
                                        {attachment.file_name ||
                                            attachment.file?.split("/").pop() ||
                                            "Attachment"}
                                    </strong>

                                    <span>
                                        Uploaded by{" "}
                                        {attachment.uploaded_by?.username ||
                                            attachment.uploaded_by_username ||
                                            attachment.uploaded_by ||
                                            "User"}
                                    </span>
                                </div>

                                {attachment.file && (
                                    <a
                                        href={attachment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-view-btn"
                                    >
                                        View <ExternalLink size={15} />
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;
