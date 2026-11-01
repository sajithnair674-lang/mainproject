
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    BellRing,
    CheckCheck,
    Check,
    Clock3,
    FolderKanban,
    ListChecks,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    Inbox,
    Eye,
} from "lucide-react";

import API from "../services/Api";
import "../App.css";

function Notifications() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isGuest = user?.role === "GUEST";

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);

    // FETCH NOTIFICATIONS
    const fetchNotifications = async () => {
        try {
            const response = await API.get("tasks/notifications/");
            const data = response.data;

            const notificationList = Array.isArray(data)
                ? data
                : data.results || [];

            setNotifications(notificationList);
            setError("");
        } catch (err) {
            console.error(
                "Notifications error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // MARK SINGLE NOTIFICATION AS READ
    const markAsRead = async (notification) => {
        if (isGuest || notification.is_read) return;

        try {
            await API.patch(
                `tasks/notifications/${notification.id}/`,
                { is_read: true }
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Mark read error:",
                err.response?.data || err.message
            );
        }
    };

    // OPEN NOTIFICATION
    const handleNotificationClick = async (notification) => {
        if (!isGuest && !notification.is_read) {
            await markAsRead(notification);
        }

        if (notification.task) {
            const taskId =
                notification.task?.id ||
                notification.task;

            navigate(`/tasks/${taskId}`);
            return;
        }

        if (notification.project) {
            const projectId =
                notification.project?.id ||
                notification.project;

            navigate(`/projects/${projectId}`);
        }
    };

    // MARK ALL AS READ
    const markAllAsRead = async () => {
        if (isGuest || markingAll) return;

        const unread = notifications.filter(
            (notification) => !notification.is_read
        );

        if (unread.length === 0) return;

        setMarkingAll(true);
        setError("");

        try {
            await Promise.all(
                unread.map((notification) =>
                    API.patch(
                        `tasks/notifications/${notification.id}/`,
                        { is_read: true }
                    )
                )
            );

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (err) {
            console.error(
                "Mark all read error:",
                err.response?.data || err.message
            );

            setError("Unable to mark all notifications as read.");
            await fetchNotifications();
        } finally {
            setMarkingAll(false);
        }
    };

    // UNREAD COUNT
    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    // DATE FORMAT
    const getNotificationDate = (notification) => {
        const date =
            notification.created_at ||
            notification.created ||
            notification.date;

        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // NOTIFICATION ICON
    const getNotificationIcon = (notification) => {
        if (notification.task) {
            return <ListChecks size={21} />;
        }

        if (notification.project) {
            return <FolderKanban size={21} />;
        }

        return <Bell size={21} />;
    };

    // LOADING
    if (loading) {
        return (
            <div className="notifications-page">
                <div className="notifications-loading">
                    <RefreshCw size={28} className="spin-icon" />
                    <h2>Loading notifications...</h2>
                    <p>Please wait while we load your updates.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">

            {/* HEADER */}
            <div className="notifications-header">
                <div className="notifications-heading">
                    <span className="section-label">
                        <BellRing size={15} />
                        Updates
                    </span>

                    <h1>Notifications</h1>

                    <p>
                        Stay updated with your team activity.
                    </p>
                </div>

                <div className="notification-header-actions">
                    <span className="notification-count">
                        <Bell size={16} />
                        {unreadCount} unread
                    </span>

                    {!isGuest && unreadCount > 0 && (
                        <button
                            type="button"
                            className="mark-all-btn"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                        >
                            <CheckCheck size={17} />
                            {markingAll
                                ? "Updating..."
                                : "Mark all as read"}
                        </button>
                    )}
                </div>
            </div>

            {/* GUEST NOTICE */}
            {isGuest && (
                <div className="guest-readonly-notice">
                    <Eye size={18} />
                    <span>
                        You can view notifications in read-only mode.
                    </span>
                </div>
            )}

            {/* ERROR */}
            {error && (
                <div className="notifications-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchNotifications}
                        aria-label="Retry loading notifications"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            )}

            {/* NOTIFICATIONS LIST */}
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-notification-icon">
                            <Inbox size={32} />
                        </div>

                        <h2>No notifications</h2>

                        <p>
                            You're all caught up. New updates will appear here.
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-card ${
                                notification.is_read ? "read" : "unread"
                            }`}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleNotificationClick(notification);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification)}
                            </div>

                            <div className="notification-content">
                                <p>{notification.message}</p>

                                <span className="notification-date">
                                    <Clock3 size={14} />
                                    {getNotificationDate(notification)}
                                </span>
                            </div>

                            <div className="notification-card-actions">
                                {!notification.is_read && (
                                    <span
                                        className="unread-dot"
                                        title="Unread"
                                    />
                                )}

                                {notification.is_read && (
                                    <Check
                                        size={17}
                                        className="read-check-icon"
                                    />
                                )}

                                {(notification.task || notification.project) && (
                                    <ArrowRight
                                        size={18}
                                        className="notification-arrow"
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;
