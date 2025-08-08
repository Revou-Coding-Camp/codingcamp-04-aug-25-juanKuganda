class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.editingId = null;
    this.initializeEventListeners();
    this.renderTasks();
    this.setTodayDate();
  }

  initializeEventListeners() {
    document
      .getElementById("todoForm")
      .addEventListener("submit", (e) => this.handleSubmit(e));
    document
      .getElementById("deleteAllBtn")
      .addEventListener("click", () => this.deleteAllTasks());
    document
      .getElementById("filterDate")
      .addEventListener("change", (e) =>
        this.filterTasks(
          e.target.value,
          document.getElementById("filterStatus").value
        )
      );
    document
      .getElementById("filterStatus")
      .addEventListener("change", (e) =>
        this.filterTasks(
          document.getElementById("filterDate").value,
          e.target.value
        )
      );
    document
      .getElementById("clearFilter")
      .addEventListener("click", () => this.clearFilter());
  }

  setTodayDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("taskDate").value = today;
  }

  loadTasks() {
    const stored = localStorage.getItem("futuristicTodos");
    return stored ? JSON.parse(stored) : [];
  }

  saveTasks() {
    localStorage.setItem("futuristicTodos", JSON.stringify(this.tasks));
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  handleSubmit(e) {
    e.preventDefault();
    const taskName = document.getElementById("taskName").value.trim();
    const taskDate = document.getElementById("taskDate").value;
    const taskStatus = document.getElementById("taskStatus").value;

    if (!taskName || !taskDate || !taskStatus) {
      this.showNotification("Please fill in all fields!", "error");
      return;
    }

    if (this.editingId) {
      this.updateTask(this.editingId, taskName, taskDate, taskStatus);
    } else {
      this.addTask(taskName, taskDate, taskStatus);
    }

    this.resetForm();
  }

  addTask(name, date, status) {
    const task = {
      id: this.generateId(),
      name,
      date,
      status,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTasks();
    this.showNotification("Task added successfully!");
  }

  updateTask(id, name, date, status) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], name, date, status };
      this.saveTasks();
      this.renderTasks();
      this.showNotification("Task updated successfully!");
    }
  }

  deleteTask(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.classList.add("removing");
      setTimeout(() => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.showNotification("Task deleted successfully!");
      }, 300);
    }
  }

  editTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      document.getElementById("taskName").value = task.name;
      document.getElementById("taskDate").value = task.date;
      document.getElementById("taskStatus").value = task.status || "pending";
      document.getElementById("btnText").textContent = "UPDATE TASK";
      document.getElementById("addBtn").style.background =
        "linear-gradient(45deg, #ffaa00, #ff6600)";
      this.editingId = id;

      // Scroll to form
      document
        .querySelector(".form-container")
        .scrollIntoView({ behavior: "smooth" });
    }
  }

  deleteAllTasks() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to delete!", "error");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete all tasks? This action cannot be undone."
      )
    ) {
      this.tasks = [];
      this.saveTasks();
      this.renderTasks();
      this.showNotification("All tasks deleted successfully!");
    }
  }

  filterTasks(date, status) {
    let filteredTasks = this.tasks;

    if (date) {
      filteredTasks = filteredTasks.filter((task) => task.date === date);
    }

    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    this.renderTasks(filteredTasks);
  }

  clearFilter() {
    document.getElementById("filterDate").value = "";
    document.getElementById("filterStatus").value = "";
    this.renderTasks();
  }

  renderTasks(tasksToRender = this.tasks) {
    const tbody = document.getElementById("taskTableBody");

    if (tasksToRender.length === 0) {
      tbody.innerHTML = `
                        <tr class="empty-state">
                            <td colspan="5">
                                <p>${
                                  this.tasks.length === 0
                                    ? "No tasks yet. Add your first task above!"
                                    : "No tasks match the selected filter."
                                }</p>
                            </td>
                        </tr>
                    `;
      return;
    }

    tbody.innerHTML = tasksToRender
      .map(
        (task, index) => `
                    <tr class="task-row" data-id="${task.id}">
                        <td>${index + 1}</td>
                        <td>${this.escapeHtml(task.name)}</td>
                        <td>${this.formatDate(task.date)}</td>
                        <td><span class="status-badge status-${
                          task.status || "pending"
                        }">${this.formatStatus(
          task.status || "pending"
        )}</span></td>
                        <td>
                        <div class="actbtn">
                        <button class="btn btn-warning btn-small" onclick="todoApp.editTask('${
                          task.id
                          }')">
                          EDIT
                          </button>
                          <button class="btn btn-danger btn-small" onclick="todoApp.deleteTask('${
                            task.id
                            }')">
                            DELETE
                            </button>
                          </div>
                        </td>
                    </tr>
                `
      )
      .join("");
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatStatus(status) {
    const statusMap = {
      pending: "Pending",
      "in-progress": "In Progress",
      completed: "Completed",
    };
    return statusMap[status] || "Pending";
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  resetForm() {
    document.getElementById("todoForm").reset();
    document.getElementById("btnText").textContent = "ADD TASK";
    document.getElementById("addBtn").style.background =
      "linear-gradient(45deg, #00f5ff, #0080ff)";
    document.getElementById("taskStatus").value = "pending";
    this.editingId = null;
    this.setTodayDate();
  }

  showNotification(message, type = "success") {
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize the app
const todoApp = new TodoApp();

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  let mouseX = 0,
    mouseY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;

    container.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
  });
});
