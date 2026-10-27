import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =========================
                    LOGIN
                ========================= */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================
                    DASHBOARD
                ========================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <Dashboard />

                            </Layout>

                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    PROJECTS
                ========================= */}

                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <Projects />

                            </Layout>

                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    PROJECT DETAILS
                ========================= */}

                <Route
                    path="/projects/:id"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <ProjectDetails />

                            </Layout>

                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    TASKS LIST
                ========================= */}

                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <Tasks />

                            </Layout>

                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    TASK DETAILS
                ========================= */}

                <Route
                    path="/tasks/:id"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <TaskDetails />

                            </Layout>

                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    NOTIFICATIONS
                ========================= */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>

                            <Layout>

                                <Notifications />

                            </Layout>

                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;