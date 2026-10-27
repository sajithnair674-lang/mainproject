
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const menuItems = [
        { path: "/dashboard", icon: "⌂", label: "Dashboard" },
        { path: "/projects", icon: "▣", label: "Projects" },
        { path: "/tasks", icon: "✓", label: "Tasks" },
        { path: "/notifications", icon: "♢", label: "Notifications" },
    ];

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        closeMenu();
        navigate("/login");
    };

    return (
        <>
            <header className="mobile-header">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

                <button
                    type="button"
                    className="mobile-brand"
                    onClick={() => navigate("/dashboard")}
                >
                    <span className="mobile-brand-icon">W</span>
                    <span>WorkFlow</span>
                </button>

                <button
                    type="button"
                    className="mobile-notification-button"
                    onClick={() => navigate("/notifications")}
                    aria-label="Open notifications"
                >
                    ♧
                </button>
            </header>

            {menuOpen && (
                <button
                    type="button"
                    className="mobile-drawer-backdrop"
                    onClick={closeMenu}
                    aria-label="Close navigation"
                />
            )}

            <aside
                className={`workflow-sidebar ${
                    menuOpen ? "mobile-sidebar-open" : ""
                }`}
            >
                <button
                    type="button"
                    className="sidebar-logo"
                    onClick={() => {
                        navigate("/dashboard");
                        closeMenu();
                    }}
                >
                    <span className="sidebar-logo-icon">W</span>
                    <span>WorkFlow</span>
                </button>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/dashboard"}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span className="sidebar-icon">⇥</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <nav
                className="mobile-bottom-nav"
                aria-label="Mobile navigation"
            >
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            isActive
                                ? "mobile-bottom-link active"
                                : "mobile-bottom-link"
                        }
                    >
                        <span className="mobile-bottom-icon">
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}

export default Navbar;
