
import { useEffect, useState } from "react";
import API from "../services/Api";
import "../App.css";

const initialForm = {
  project: "",
  title: "",
  description: "",
  assigned_to: "",
  priority: "MEDIUM",
  status: "TODO",
  start_date: "",
  due_date: "",
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [taskResponse, projectResponse] = await Promise.all([
        API.get("/tasks/"),
        API.get("/projects/"),
      ]);

      const taskData = taskResponse.data;
      const projectData = projectResponse.data;

      setTasks(
        Array.isArray(taskData)
          ? taskData
          : taskData.results || []
      );

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : projectData.results || []
      );
    } catch (err) {
      console.error("Loading tasks failed:", err);

      setError(
        err.response?.data?.detail ||
          "Could not load tasks or projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(projectId) {
    setMembers([]);
    setError("");

    setForm((previous) => ({
      ...previous,
      project: projectId,
      assigned_to: "",
    }));

    if (!projectId) return;

    setLoadingMembers(true);

    try {
      const response = await API.get(
        `/projects/${projectId}/members/`
      );

      const data = response.data;

      setMembers(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error("Loading project members failed:", err);

      setError(
        err.response?.data?.detail ||
          "Could not load project members. You can still create an unassigned task."
      );
    } finally {
      setLoadingMembers(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setForm(initialForm);
    setMembers([]);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setForm(initialForm);
    setMembers([]);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        project: Number(form.project),
        assigned_to: form.assigned_to
          ? Number(form.assigned_to)
          : null,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
      };

      const response = await API.post("/tasks/", payload);

      setTasks((previous) => [
        response.data,
        ...previous,
      ]);

      setForm(initialForm);
      setMembers([]);
      setShowForm(false);
      setSuccess("Task created successfully!");
    } catch (err) {
      console.error("Creating task failed:", err);

      const data = err.response?.data;

      const message =
        typeof data === "string"
          ? data
          : data
            ? Object.entries(data)
                .map(([field, messages]) => {
                  const text = Array.isArray(messages)
                    ? messages
                        .map((item) =>
                          typeof item === "object"
                            ? JSON.stringify(item)
                            : String(item)
                        )
                        .join(", ")
                    : typeof messages === "object" &&
                        messages !== null
                      ? JSON.stringify(messages)
                      : String(messages);

                  return `${field}: ${text}`;
                })
                .join(" | ")
            : "Unable to create task. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>Manage and track your team's tasks.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          + Create Task
        </button>
      </div>

      {error && !showForm && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-tasks">
          <h2>No tasks yet</h2>
          <p>Create your first task to get started.</p>
        </div>
      ) : (
        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>

                    {task.description && (
                      <div className="task-description">
                        {task.description}
                      </div>
                    )}
                  </td>

                  <td>{task.project_name || "—"}</td>

                  <td>
                    {task.assigned_to_username || "Unassigned"}
                  </td>

                  <td>
                    <span className="task-badge">
                      {task.priority || "MEDIUM"}
                    </span>
                  </td>

                  <td>
                    <span className="task-badge">
                      {(task.status || "TODO").replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>{task.due_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="create-task-title">Create Task</h2>
                <p>Add a new task to your project.</p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Project *
                <select
                  name="project"
                  value={form.project}
                  onChange={(event) =>
                    loadMembers(event.target.value)
                  }
                  required
                >
                  <option value="">Select project</option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Task title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                  required
                  placeholder="Enter task title"
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the task"
                />
              </label>

              <label>
                Assign to
                <select
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  disabled={!form.project || loadingMembers}
                >
                  <option value="">
                    {loadingMembers
                      ? "Loading members..."
                      : "Unassigned"}
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.user}
                    >
                      {member.username}
                    </option>
                  ))}
                </select>

                {form.project &&
                  !loadingMembers &&
                  members.length === 0 && (
                    <small>
                      No project members found. You can leave
                      this task unassigned.
                    </small>
                  )}
              </label>

              <div className="form-grid">
                <label>
                  Priority
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </label>

                <label>
                  Start date
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Due date
                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    min={form.start_date || undefined}
                  />
                </label>
              </div>

              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving || loadingMembers}
                >
                  {saving ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
