const url = "https://693e9a3c12c964ee6b6dd5a7.mockapi.io/";

const theme = document.body;
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");

const darkModeBtn = document.getElementById("dark-mode-btn");
const saveTaskButton = document.getElementById("save-task-button");
const addTaskButton = document.getElementById("add-task-button");
const allTasksButton = document.getElementById("all-tasks-button");
const activeTasksButton = document.getElementById("active-tasks-button");
const doneTasksButton = document.getElementById("done-tasks-button");
const editingOverlay = document.getElementById("editing-overlay");
const cancelTaskButton = document.getElementById("cancel-task-button");
const titleError = document.getElementById("title-error");

let darkMode = localStorage.getItem("dark-mode") || "disabled";
let allTasks = [];
let currentFilter = "all";
let editingTaskId = null;

function openEditor() {
  taskTitle.classList.remove("is-invalid");
  titleError.classList.add("d-none");

  editingOverlay.classList.remove("d-none");
}

function closeEditor() {
  editingOverlay.classList.add("d-none");

  editingTaskId = null;
  taskTitle.value = "";
  taskDescription.value = "";
  taskTitle.classList.remove("is-invalid");
  titleError.classList.add("d-none");
}

const enableDarkMode = () => {
  theme.classList.add("dark-mode-theme");
  localStorage.setItem("dark-mode", "enabled");
};

const disableDarkMode = () => {
  theme.classList.remove("dark-mode-theme");
  localStorage.setItem("dark-mode", "disabled");
};

if (darkMode === "enabled") {
  enableDarkMode();
}

darkModeBtn.addEventListener("click", () => {
  darkMode = localStorage.getItem("dark-mode") || "disabled";
  if (darkMode === "enabled") {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
});

addTaskButton.addEventListener("click", function () {
  editingTaskId = null;
  taskTitle.value = "";
  taskDescription.value = "";
  openEditor();
});

cancelTaskButton.addEventListener("click", function () {
  closeEditor();
});

saveTaskButton.addEventListener("click", function () {
  const title = taskTitle.value.trim();
  const description = taskDescription.value;

  taskTitle.classList.remove("is-invalid");
  titleError.classList.add("d-none");

  if (title === "") {
    taskTitle.classList.add("is-invalid");
    titleError.classList.remove("d-none");
    taskTitle.focus();
    return;
  }

  if (editingTaskId === null) {
    createTask(title, description);
  } else {
    updateTask(editingTaskId, title, description);
  }

  closeEditor();
});

allTasksButton.addEventListener("click", function () {
  currentFilter = "all";
  setActiveFilterButton("all");
  renderTasks(allTasks);
});

activeTasksButton.addEventListener("click", function () {
  currentFilter = "active";
  setActiveFilterButton("active");
  renderTasks(allTasks.filter((task) => task.active));
});

doneTasksButton.addEventListener("click", function () {
  currentFilter = "done";
  setActiveFilterButton("done");
  renderTasks(allTasks.filter((task) => !task.active));
});

const setActiveFilterButton = (filter) => {
  allTasksButton.classList.remove("active-filter");
  activeTasksButton.classList.remove("active-filter");
  doneTasksButton.classList.remove("active-filter");

  if (filter === "all"){
    allTasksButton.classList.add("active-filter");
  }else if (filter === "active") {
    activeTasksButton.classList.add("active-filter");
  } else if (filter === "done") {
    doneTasksButton.classList.add ("active-filter");
  }
}

setActiveFilterButton(currentFilter);

const fetchTasks = async () => {
  try {
    const response = await fetch(url + "tasks");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const tasks = await response.json();
    allTasks = tasks.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (currentFilter === "all") {
      return renderTasks(allTasks);
    }

    renderTasks(allTasks.filter((task) => task.active === currentFilter === "active"));

  } catch (error) {
    console.error(error);
  }
};

const createTask = async (taskTitle, taskDescription) => {
  try {
    const response = await fetch(url + "tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createdAt: new Date().toISOString(),
        title: taskTitle,
        description: taskDescription,
        active: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    await response.json();
    fetchTasks();
  } catch (error) {
    console.error(error);
  }
};

const deleteTask = async (id) => {
  try {
    const response = await fetch(url + "tasks/" + id, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    fetchTasks();
  } catch (error) {
    console.error(error);
  }
};

const activeTask = async (id, isActive) => {
  try {
    const response = await fetch(url + "tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: isActive }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    await response.json();
    fetchTasks();
  } catch (error) {
    console.error(error);
  }
};

const updateTask = async (id, title, description) => {
  try {
    const response = await fetch(url + "tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    await response.json();
    fetchTasks();
  } catch (error) {
    console.error(error);
  }
};

const renderTasks = (tasks) => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.classList.add("task");

    if (task.active === true) {
      div.classList.add("task-active");
    } else {
      div.classList.add("task-done");
    }

    div.style.opacity = 0;
    div.style.transform = "translateY(10px)";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    if (task.active === true) {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", function () {
      if (checkbox.checked === true) {
        activeTask(task.id, false);
      } else {
        activeTask(task.id, true);
      };
    });

    const h3 = document.createElement("h3");
    h3.textContent = task.title;

    const header = document.createElement("div");
    header.classList.add("task-header");
    header.appendChild(checkbox);
    header.appendChild(h3);
    div.appendChild(header);

    const p = document.createElement("p");
    p.textContent = task.description;
    div.appendChild(p);

    const del = document.createElement("button");
    del.textContent = "delete";
    del.classList.add("btn", "btn-outline-danger", "btn-sm");
    del.addEventListener("click", function () {
      deleteTask(task.id);
    });

    const edit = document.createElement("button");
    edit.textContent = "edit";
    edit.classList.add("btn", "btn-outline-secondary", "btn-sm");
    edit.addEventListener("click", function () {
      editingTaskId = task.id;
      taskTitle.value = task.title;
      taskDescription.value = task.description;
      openEditor();
    });

    const buttons = document.createElement("div");
    buttons.classList.add("task-buttons");
    buttons.appendChild(del);
    buttons.appendChild(edit);

    div.appendChild(buttons);
    taskList.appendChild(div);

    anime({
      targets: div,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 300,
      easing: "easeOutCubic",
    });
  });
};

fetchTasks();

