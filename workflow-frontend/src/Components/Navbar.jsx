
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    FolderKanban,
    ListChecks,
    Bell,
    LogOut,
    Menu,
    X,
    Workflow,
} from "lucide-react";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const menuItems = [
        {
            path: "/dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
        },
        {
            path: "/projects",
            icon: FolderKanban,
            label: "Projects",
        },
        {
            path: "/tasks",
            icon: ListChecks,
            label: "Tasks",
        },
        {
            path: "/notifications",
            icon: Bell,
            label: "Notifications",
        },
    ];

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        closeMenu();
        navigate("/login");
    };

    const renderBrand = (className, iconClassName) => (
        <>
            <span className={iconClassName}>
                <Workflow size={23} strokeWidth={2.2} />
            </span>
            <span>{className === "mobile-brand" ? "WorkFlow" : "WorkFlow"}</span>
        </>
    );

    return (
        <>
            {/* MOBILE HEADER */}

            <header className="mobile-header">

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={23} /> : <Menu size={23} />}
                </button>

                <button
                    type="button"
                    className="mobile-brand"
                    onClick={() => navigate("/dashboard")}
                >
                    {renderBrand("mobile-brand", "mobile-brand-icon")}
                </button>

                <button
                    type="button"
                    className="mobile-notification-button"
                    onClick={() => navigate("/notifications")}
                    aria-label="Open notifications"
                >
                    <Bell size={21} />
                </button>

            </header>

            {/* MOBILE BACKDROP */}

            {menuOpen && (
                <button
                    type="button"
                    className="mobile-drawer-backdrop"
                    onClick={closeMenu}
                    aria-label="Close navigation"
                />
            )}

            {/* SIDEBAR */}

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
                    {renderBrand("sidebar-logo", "sidebar-logo-icon")}
                </button>

                <nav className="sidebar-menu">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
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
                                <Icon
                                    className="sidebar-icon"
                                    size={20}
                                    strokeWidth={2}
                                />

                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}

                </nav>

                {/* LOGOUT */}

                <div className="sidebar-bottom">

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <LogOut
                            className="sidebar-icon"
                            size={20}
                        />

                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MOBILE BOTTOM NAVIGATION */}

            <nav
                className="mobile-bottom-nav"
                aria-label="Mobile navigation"
            >

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
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
                            <Icon
                                className="mobile-bottom-icon"
                                size={21}
                                strokeWidth={2}
                            />

                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}

            </nav>
        </>
    );
}

export default Navbar;
