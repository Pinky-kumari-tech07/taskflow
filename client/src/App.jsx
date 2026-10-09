
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/tasks`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    status: "Pending",
    dueDate: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadTasks() {
    try {
      setError("");
      const response = await axios.get(API_URL);
      setTasks(response.data.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(
        "Unable to load tasks. Please check the backend connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      progress: tasks.filter((task) => task.status === "In Progress").length,
      completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks]
  );

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesSearch && (filter === "All" || task.status === filter);
  });

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingId(task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Pending",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        ...form,
        dueDate: form.dueDate || null,
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadTasks();
    } catch (err) {
      console.error("Failed to save task:", err);
      setError(
        err.response?.data?.message ||
          "Unable to save the task. Please try again."
      );
    }
  }

  async function toggleComplete(task) {
    try {
      setError("");

      const nextStatus =
        task.status === "Completed" ? "Pending" : "Completed";

      await axios.put(`${API_URL}/${task._id}`, {
        status: nextStatus,
      });

      await loadTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Unable to update task status.");
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");
      await axios.delete(`${API_URL}/${id}`);
      await loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Unable to delete the task.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">✓</span>
          <span>
            TaskFlow<span className="brand-dot">.</span>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>
        <div className="nav-item">
          <span>◷</span> My Tasks
        </div>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Stay on track!</strong>
            <p>Small steps every day lead to big results.</p>
          </div>

          <div className="profile">
            <div className="avatar">P</div>
            <div>
              <strong>My Workspace</strong>
              <small>Personal account</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>
          <div className="topbar-right">
            <span className="online-dot"></span> Task manager
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR PRODUCTIVITY SPACE</p>
              <h1>
                Good work starts here<span> ✨</span>
              </h1>
              <p className="subtitle">
                Organize your day, focus on what matters, and get things done.
              </p>
            </div>

            <button className="primary-btn" onClick={openCreateForm}>
              <span>＋</span> Add New Task
            </button>
          </div>

          <div className="stats-grid">
            <StatCard
              label="Total Tasks"
              count={counts.total}
              icon="▤"
              tone="purple"
            />
            <StatCard
              label="Pending"
              count={counts.pending}
              icon="◷"
              tone="orange"
            />
            <StatCard
              label="In Progress"
              count={counts.progress}
              icon="↗"
              tone="blue"
            />
            <StatCard
              label="Completed"
              count={counts.completed}
              icon="✓"
              tone="green"
            />
          </div>

          <section className="tasks-panel">
            <div className="panel-heading">
              <div>
                <h2>My Tasks</h2>
                <p>
                  You have {counts.pending + counts.progress} tasks left to
                  focus on.
                </p>
              </div>
              <span className="task-total">{counts.total} total</span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your tasks..."
                  aria-label="Search tasks"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter tasks by status"
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {showForm && (
              <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-heading">
                  <h3>{editingId ? "Edit task" : "Create a new task"}</h3>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={() => setShowForm(false)}
                    aria-label="Close form"
                  >
                    ×
                  </button>
                </div>

                <label htmlFor="task-title">Task title *</label>
                <input
                  id="task-title"
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Complete project README"
                />

                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Add a few details..."
                />

                <div className="form-two-columns">
                  <div>
                    <label htmlFor="task-status">Status</label>
                    <select
                      id="task-status"
                      value={form.status}
                      onChange={(event) =>
                        setForm({ ...form, status: event.target.value })
                      }
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-due-date">Due date</label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm({ ...form, dueDate: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingId ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="loader"></div>
                <h3>Loading your tasks...</h3>
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{search ? "⌕" : "✓"}</div>
                <h3>
                  {search || filter !== "All"
                    ? "No matching tasks"
                    : "Your space is ready!"}
                </h3>
                <p>
                  {search || filter !== "All"
                    ? "Try changing your search or filter."
                    : "Add your first task and start making progress."}
                </p>
                {!search && filter === "All" && (
                  <button className="primary-btn" onClick={openCreateForm}>
                    ＋ Create your first task
                  </button>
                )}
              </div>
            ) : (
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <article
                    className={`task-card ${
                      task.status === "Completed" ? "is-completed" : ""
                    }`}
                    key={task._id}
                  >
                    <button
                      className={`check-button ${
                        task.status === "Completed" ? "checked" : ""
                      }`}
                      onClick={() => toggleComplete(task)}
                      title={
                        task.status === "Completed"
                          ? "Mark pending"
                          : "Mark completed"
                      }
                      aria-label={
                        task.status === "Completed"
                          ? "Mark task as pending"
                          : "Mark task as completed"
                      }
                    >
                      {task.status === "Completed" ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}

                      <div className="task-meta">
                        <span
                          className={`status-badge ${task.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          <span className="status-dot"></span>
                          {task.status}
                        </span>

                        {task.dueDate && (
                          <span className="due-date">
                            ◷{" "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        onClick={() => openEditForm(task)}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        ⌫
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="footer-note">
            Made for better focus, one task at a time. <span>✦</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, count, icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{count}</strong>
      </div>
      <div className={`stat-decoration ${tone}`}></div>
    </div>
  );
}

export default App;