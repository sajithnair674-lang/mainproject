import { useEffect, useState } from "react";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Notifications() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {

        try {

            const response = await API.get(
                "tasks/notifications/"
            );

            const data = response.data;

            const notificationList =
                Array.isArray(data)
                    ? data
                    : data.results || [];

            setNotifications(notificationList);

        } catch (err) {

            console.error(
                err.response?.data ||
                err.message
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


    const markAsRead = async (notification) => {

        try {

            await API.patch(
                `tasks/notifications/${notification.id}/`,
                {
                    is_read: true,
                }
            );

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notification.id
                        ? {
                            ...item,
                            is_read: true,
                        }
                        : item
                )
            );

        } catch (err) {

            console.error(
                "Mark read error:",
                err.response?.data ||
                err.message
            );

        }
    };


    const handleNotificationClick = async (
        notification
    ) => {

        if (!notification.is_read) {

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


    const markAllAsRead = async () => {

        const unread =
            notifications.filter(
                (notification) =>
                    !notification.is_read
            );

        try {

            await Promise.all(
                unread.map((notification) =>
                    API.patch(
                        `tasks/notifications/${notification.id}/`,
                        {
                            is_read: true,
                        }
                    )
                )
            );

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );

        } catch (err) {

            console.error(
                "Mark all read error:",
                err.response?.data ||
                err.message
            );

        }

    };


    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;


    const getNotificationDate = (
        notification
    ) => {

        const date =
            notification.created_at ||
            notification.created ||
            notification.date;

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString();

    };


    if (loading) {

        return (
            <div className="notifications-page">

                <p>
                    Loading notifications...
                </p>

            </div>
        );

    }


    return (

        <div className="notifications-page">

            {/* HEADER */}

            <div className="notifications-header">

                <div>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated with your team activity.
                    </p>

                </div>


                <div className="notification-header-actions">

                    <span className="notification-count">

                        {unreadCount} unread

                    </span>


                    {unreadCount > 0 && (

                        <button
                            className="mark-all-btn"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </button>

                    )}

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <p className="message error-message">

                    {error}

                </p>

            )}


            {/* NOTIFICATIONS */}

            <div className="notifications-list">

                {notifications.length === 0 ? (

                    <div className="empty-notifications">

                        <div className="empty-notification-icon">
                            🔔
                        </div>

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            You're all caught up.
                        </p>

                    </div>

                ) : (

                    notifications.map(
                        (notification) => (

                            <div
                                key={notification.id}
                                className={`notification-card ${
                                    notification.is_read
                                        ? "read"
                                        : "unread"
                                }`}
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                            >

                                <div className="notification-icon">

                                    🔔

                                </div>


                                <div className="notification-content">

                                    <p>
                                        {notification.message}
                                    </p>

                                    <span>
                                        {getNotificationDate(
                                            notification
                                        )}
                                    </span>

                                </div>


                                {!notification.is_read && (

                                    <span className="unread-dot"></span>

                                )}

                            </div>

                        )
                    )

                )}

            </div>

        </div>

    );

}

export default Notifications;