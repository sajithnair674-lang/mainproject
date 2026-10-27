import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/Api";
import "../App.css";

function TaskDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [members, setMembers] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [attachments, setAttachments] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);

    const [attachmentLoading, setAttachmentLoading] = useState(false);
    const [attachmentError, setAttachmentError] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [commentError, setCommentError] = useState("");

    const [commentText, setCommentText] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        assigned_to: "",
        due_date: "",
    });


    // =========================
    // FETCH TASK
    // =========================

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

                due_date: data.due_date || "",
            });

        } catch (err) {

            console.error(
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load task details."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // FETCH MEMBERS
    // =========================

    const fetchMembers = async () => {

        try {

            if (!task?.project) {
                return;
            }

            const projectId =
                task.project?.id ||
                task.project;

            const response = await API.get(
                `projects/${projectId}/members/`
            );

            const memberList =
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

            setMembers(memberList);

        } catch (err) {

            console.error(
                "Members error:",
                err.response?.data ||
                err.message
            );

        }
    };


    // =========================
    // FETCH COMMENTS
    // =========================

    const fetchComments = async () => {

        try {

            const response = await API.get(
                `tasks/${id}/comments/`
            );

            const commentList =
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

            setComments(commentList);

        } catch (err) {

            console.error(
                "Comments error:",
                err.response?.data ||
                err.message
            );

            setCommentError(
                "Unable to load comments."
            );

        }
    };


    // =========================
    // FETCH ACTIVITIES
    // =========================

    const fetchActivities = async () => {

        try {

            const response = await API.get(
                `tasks/activities/?task=${id}`
            );

            const activityList =
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

            setActivities(activityList);

        } catch (err) {

            console.error(
                "Activities error:",
                err.response?.data ||
                err.message
            );

        }
    };


    // =========================
    // FETCH ATTACHMENTS
    // =========================

    const fetchAttachments = async () => {

        try {

            const response = await API.get(
                `tasks/${id}/attachments/`
            );

            const attachmentList =
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

            setAttachments(attachmentList);

        } catch (err) {

            console.error(
                "Attachments error:",
                err.response?.data ||
                err.message
            );

            setAttachmentError(
                "Unable to load attachments."
            );

        }
    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchTask();
        fetchComments();
        fetchActivities();
        fetchAttachments();

    }, [id]);


    // =========================
    // LOAD MEMBERS
    // =========================

    useEffect(() => {

        if (task) {
            fetchMembers();
        }

    }, [task]);


    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };


    // =========================
    // UPDATE TASK
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError("");

        try {

            await API.patch(
                `tasks/${id}/`,
                {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    status: formData.status,

                    assigned_to:
                        formData.assigned_to || null,

                    due_date:
                        formData.due_date || null,
                }
            );

            alert("Task updated successfully!");

            await fetchTask();
            await fetchActivities();

        } catch (err) {

            console.error(
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to update task."
            );

        } finally {

            setSaving(false);

        }
    };


    // =========================
    // DELETE TASK
    // =========================

    const handleDeleteTask = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        setDeleting(true);
        setError("");

        try {

            await API.delete(
                `tasks/${id}/`
            );

            alert("Task deleted successfully!");

            navigate(-1);

        } catch (err) {

            console.error(
                "Delete task error:",
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to delete task."
            );

        } finally {

            setDeleting(false);

        }
    };


    // =========================
    // ADD COMMENT
    // =========================

    const handleCommentSubmit = async (e) => {

        e.preventDefault();

        if (!commentText.trim()) {

            setCommentError(
                "Please enter a comment."
            );

            return;
        }

        setCommentLoading(true);
        setCommentError("");

        try {

            await API.post(
                `tasks/${id}/comments/`,
                {
                    comment: commentText.trim(),
                }
            );

            setCommentText("");

            await fetchComments();
            await fetchActivities();

        } catch (err) {

            console.error(
                err.response?.data ||
                err.message
            );

            setCommentError(
                err.response?.data?.detail ||
                "Unable to add comment."
            );

        } finally {

            setCommentLoading(false);

        }
    };


    // =========================
    // UPLOAD ATTACHMENT
    // =========================

    const handleAttachmentUpload = async (e) => {

        e.preventDefault();

        if (!selectedFile) {

            setAttachmentError(
                "Please select a file."
            );

            return;
        }

        setAttachmentLoading(true);
        setAttachmentError("");

        try {

            const uploadData = new FormData();

            uploadData.append(
                "file",
                selectedFile
            );

            uploadData.append(
                "file_name",
                selectedFile.name
            );

            await API.post(
                `tasks/${id}/attachments/`,
                uploadData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            setSelectedFile(null);

            const fileInput =
                document.getElementById(
                    "task-attachment-input"
                );

            if (fileInput) {
                fileInput.value = "";
            }

            await fetchAttachments();
            await fetchActivities();

        } catch (err) {

            console.error(
                "Upload error:",
                err.response?.data ||
                err.message
            );

            setAttachmentError(
                err.response?.data?.detail ||
                "Unable to upload attachment."
            );

        } finally {

            setAttachmentLoading(false);

        }
    };


    // =========================
    // MEMBER HELPERS
    // =========================

    const getMemberId = (member) => {

        return (
            member.user?.id ||
            member.user ||
            member.id
        );

    };


    const getMemberName = (member) => {

        return (
            member.username ||
            member.user?.username ||
            member.name ||
            `User ${getMemberId(member)}`
        );

    };


    // =========================
    // COMMENT USER
    // =========================

    const getCommentUser = (comment) => {

        return (
            comment.user?.username ||
            comment.username ||
            comment.user_name ||
            comment.user ||
            "User"
        );

    };


    // =========================
    // COMMENT DATE
    // =========================

    const getCommentDate = (comment) => {

        const date =
            comment.created_at ||
            comment.created ||
            comment.date;

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString();

    };


    // =========================
    // ACTIVITY USER
    // =========================

    const getActivityUser = (activity) => {

        return (
            activity.user?.username ||
            activity.username ||
            activity.user_name ||
            activity.user ||
            "User"
        );

    };


    // =========================
    // ACTIVITY DATE
    // =========================

    const getActivityDate = (activity) => {

        const date =
            activity.created_at ||
            activity.created ||
            activity.date;

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString();

    };


    // =========================
    // ACTIVITY ICON
    // =========================

    const getActivityIcon = (action) => {

        switch (action) {

            case "PROJECT_CREATED":
                return "📁";

            case "TASK_CREATED":
                return "✓";

            case "TASK_UPDATED":
                return "✏️";

            case "TASK_DELETED":
                return "🗑️";

            case "COMMENT_ADDED":
                return "💬";

            case "ATTACHMENT_ADDED":
                return "📎";

            default:
                return "•";
        }

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="task-details-page">

                <p>
                    Loading task...
                </p>

            </div>
        );

    }


    // =========================
    // TASK NOT FOUND
    // =========================

    if (!task) {

        return (
            <div className="task-details-page">

                <p className="error-message">
                    {error || "Task not found."}
                </p>

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Go Back
                </button>

            </div>
        );

    }


    // =========================
    // MAIN PAGE
    // =========================

    return (

        <div className="task-details-page">


            {/* =========================
                TOP ACTIONS
            ========================= */}

            <div
                className="task-top-actions"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "25px"
                }}
            >

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                    style={{
                        margin: 0
                    }}
                >
                    ← Back
                </button>


                <button
                    className="delete-task-btn"
                    onClick={handleDeleteTask}
                    disabled={deleting}
                >

                    {deleting
                        ? "Deleting..."
                        : "🗑️ Delete Task"}

                </button>

            </div>


            {/* =========================
                TASK HEADER
            ========================= */}

            <div className="task-details-header">

                <div>

                    <span className="task-page-label">
                        Task Details
                    </span>

                    <h1>
                        {task.title}
                    </h1>

                    <p>
                        {task.description ||
                            "No description available."}
                    </p>

                </div>


                <div className="task-page-status">

                    <span>
                        {task.status}
                    </span>

                    <span>
                        {task.priority}
                    </span>

                </div>

            </div>


            {/* =========================
                EDIT TASK
            ========================= */}

            <div className="task-edit-section">

                <h2>
                    Edit Task
                </h2>


                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}


                <form
                    className="task-edit-form"
                    onSubmit={handleSubmit}
                >


                    <div className="form-group">

                        <label>
                            Task Title
                        </label>

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

                        <label>
                            Description
                        </label>

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

                            <label>
                                Priority
                            </label>

                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
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
                                value={formData.status}
                                onChange={handleChange}
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


                    <div className="form-group">

                        <label>
                            Assigned To
                        </label>

                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                        >

                            <option value="">
                                Unassigned
                            </option>

                            {members.map((member) => {

                                const memberId =
                                    getMemberId(member);

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

                        <label>
                            Due Date
                        </label>

                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                        />

                    </div>


                    <button
                        type="submit"
                        className="save-task-btn"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </form>

            </div>


            {/* =========================
                TASK INFORMATION
            ========================= */}

            <div className="task-information">

                <h2>
                    Task Information
                </h2>


                <div className="task-information-grid">

                    <div>

                        <span>
                            Task ID
                        </span>

                        <strong>
                            #{task.id}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Status
                        </span>

                        <strong>
                            {task.status}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Priority
                        </span>

                        <strong>
                            {task.priority}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Due Date
                        </span>

                        <strong>
                            {task.due_date || "Not set"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================
                COMMENTS
            ========================= */}

            <div className="task-comments-section">

                <div className="comments-header">

                    <div>

                        <h2>
                            Comments
                        </h2>

                        <p>
                            Discuss this task with your team.
                        </p>

                    </div>

                    <span className="comment-count">
                        {comments.length}
                    </span>

                </div>


                {commentError && (

                    <p className="error-message">
                        {commentError}
                    </p>

                )}


                <form
                    className="comment-form"
                    onSubmit={handleCommentSubmit}
                >

                    <textarea
                        value={commentText}
                        onChange={(e) =>
                            setCommentText(e.target.value)
                        }
                        placeholder="Write a comment..."
                        rows="4"
                    />


                    <div className="comment-form-footer">

                        <span>
                            Share an update with your team
                        </span>


                        <button
                            type="submit"
                            disabled={commentLoading}
                        >

                            {commentLoading
                                ? "Posting..."
                                : "Add Comment"}

                        </button>

                    </div>

                </form>


                <div className="comments-list">

                    {comments.length === 0 ? (

                        <div className="no-comments">

                            <div className="no-comments-icon">
                                💬
                            </div>

                            <h3>
                                No comments yet
                            </h3>

                            <p>
                                Be the first to leave a comment.
                            </p>

                        </div>

                    ) : (

                        comments.map((comment) => (

                            <div
                                className="comment-card"
                                key={comment.id}
                            >

                                <div className="comment-avatar">

                                    {getCommentUser(comment)
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div className="comment-content">

                                    <div className="comment-top">

                                        <strong>
                                            {getCommentUser(comment)}
                                        </strong>

                                        <span>
                                            {getCommentDate(comment)}
                                        </span>

                                    </div>


                                    <p>
                                        {comment.comment}
                                    </p>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>


            {/* =========================
                ACTIVITY TIMELINE
            ========================= */}

            <div className="task-activity-section">

                <div className="activity-header">

                    <div>

                        <h2>
                            Activity Timeline
                        </h2>

                        <p>
                            Track the recent activity on this task.
                        </p>

                    </div>


                    <span className="activity-count">
                        {activities.length}
                    </span>

                </div>


                <div className="activity-timeline">

                    {activities.length === 0 ? (

                        <div className="no-activity">

                            <div className="no-activity-icon">
                                🕒
                            </div>

                            <h3>
                                No activity yet
                            </h3>

                            <p>
                                Task activity will appear here.
                            </p>

                        </div>

                    ) : (

                        activities.map((activity) => (

                            <div
                                className="activity-item"
                                key={activity.id}
                            >

                                <div className="activity-icon">

                                    {getActivityIcon(
                                        activity.action
                                    )}

                                </div>


                                <div className="activity-content">

                                    <div className="activity-top">

                                        <strong>
                                            {getActivityUser(activity)}
                                        </strong>

                                        <span>
                                            {getActivityDate(activity)}
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


            {/* =========================
                ATTACHMENTS
            ========================= */}

            <div className="task-attachments-section">

                <div className="attachments-header">

                    <div>

                        <h2>
                            Attachments
                        </h2>

                        <p>
                            Upload files related to this task.
                        </p>

                    </div>


                    <span className="attachment-count">
                        {attachments.length}
                    </span>

                </div>


                {attachmentError && (

                    <p className="error-message">
                        {attachmentError}
                    </p>

                )}


                {/* UPLOAD FORM */}

                <form
                    className="attachment-upload-form"
                    onSubmit={handleAttachmentUpload}
                >

                    <input
                        id="task-attachment-input"
                        type="file"
                        onChange={(e) =>
                            setSelectedFile(
                                e.target.files[0] || null
                            )
                        }
                    />


                    <button
                        type="submit"
                        disabled={attachmentLoading}
                    >

                        {attachmentLoading
                            ? "Uploading..."
                            : "Upload File"}

                    </button>

                </form>


                {/* ATTACHMENT LIST */}

                <div className="attachments-list">

                    {attachments.length === 0 ? (

                        <div className="no-attachments">

                            <div className="no-attachments-icon">
                                📎
                            </div>

                            <h3>
                                No attachments yet
                            </h3>

                            <p>
                                Upload a file related to this task.
                            </p>

                        </div>

                    ) : (

                        attachments.map((attachment) => (

                            <div
                                className="attachment-card"
                                key={attachment.id}
                            >

                                <div className="attachment-icon">
                                    📄
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
                                        View
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