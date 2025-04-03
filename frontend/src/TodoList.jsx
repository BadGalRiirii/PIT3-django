import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Fetch tasks from the Django API
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch("https://pit4-django.onrender.com/api/todos/fetch/");
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (task.trim() === "") return;
    const newTask = { title: task, completed: false };

    const response = await fetch("https://pit4-django.onrender.com/api/todos/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    const data = await response.json();
    setTasks([...tasks, data]);
    setTask("");
  };

  const removeTask = async (taskId) => {
    await fetch(`https://pit4-django.onrender.com/api/todos/${taskId}/delete/`, {
      method: "DELETE",
    });
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const toggleComplete = async (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    const updatedTask = { ...task, completed: !task.completed };

    const response = await fetch(`https://pit4-django.onrender.com/api/todos/${taskId}/update/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    const data = await response.json();
    setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
  };

  const editTask = (index) => {
    setEditingIndex(index);
    setEditedTask(tasks[index].title);
  };

  const saveEditedTask = async (taskId) => {
    if (editedTask.trim() === "") return;
    const updatedTask = { title: editedTask, completed: false };

    const response = await fetch(`https://pit4-django.onrender.com/api/todos/${taskId}/update/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    const data = await response.json();
    setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    setEditingIndex(null);
  };

  const clearCompleted = async () => {
    const completedTasks = tasks.filter((task) => task.completed);
    for (const task of completedTasks) {
      await removeTask(task.id);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <h2>To-Do List</h2>

      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="todo-input">
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button className="add-task" onClick={addTask}>Add Task</button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <ul className="todo-list">
        <AnimatePresence>
          {filteredTasks.map((t, index) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className={t.completed ? "completed" : ""}
            >
              <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t.id)} />

              {editingIndex === index ? (
                <>
                  <input type="text" value={editedTask} onChange={(e) => setEditedTask(e.target.value)} />
                  <button onClick={() => saveEditedTask(t.id)}>Save</button>
                </>
              ) : (
                <>
                  {t.title}
                  <button onClick={() => editTask(index)}>Edit</button>
                  <button onClick={() => removeTask(t.id)}>Delete</button>
                </>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <button className="clear-btn" onClick={clearCompleted}>
        Clear Completed Tasks
      </button>
    </div>
  );
}
