const url = "https://693e9a3c12c964ee6b6dd5a7.mockapi.io/";

const theme = document.body;
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDeadline = document.getElementById("task-deadline");

const darkModeBtn = document.getElementById("dark-mode-btn");
const saveTaskButton = document.getElementById("save-task-button");
const addTaskButton = document.getElementById("add-task-button");
const allTasksButton = document.getElementById("all-tasks-button");
const activeTasksButton = document.getElementById("active-tasks-button");
const doneTasksButton = document.getElementById("done-tasks-button");
const editingOverlay = document.getElementById("editing-overlay");
const cancelTaskButton = document.getElementById("cancel-task-button");
const titleError = document.getElementById("title-error");
const tasksPerPage = 5;

let darkMode = localStorage.getItem("dark-mode") || "disabled";
let allTasks = [];
let currentFilter = localStorage.getItem("currentFilter") || "all";
let currentPage = 1;
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
  taskDeadline.value = "";
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
  taskDeadline.value = "";
  openEditor();
});

cancelTaskButton.addEventListener("click", function () {
  closeEditor();
});

saveTaskButton.addEventListener("click", function () {
  const title = taskTitle.value.trim();
  const description = taskDescription.value;
  const deadline = taskDeadline.value;

  taskTitle.classList.remove("is-invalid");
  titleError.classList.add("d-none");

  if (title === "") {
    taskTitle.classList.add("is-invalid");
    titleError.classList.remove("d-none");
    taskTitle.focus();
    return;
  }

  if (editingTaskId === null) {
    createTask(title, description, deadline);
  } else {
    updateTask(editingTaskId, title, description, deadline);
  }

  closeEditor();
});

allTasksButton.addEventListener("click", function () {
  currentFilter = "all";
  currentPage = 1;
  localStorage.setItem("currentFilter", "all");
  setActiveFilterButton("all");
  fetchTasks(currentPage, tasksPerPage);
});

activeTasksButton.addEventListener("click", function () {
  currentFilter = "active";
  currentPage = 1;
  localStorage.setItem("currentFilter", "active");
  setActiveFilterButton("active");
  fetchTasks(currentPage, tasksPerPage);
});

doneTasksButton.addEventListener("click", function () {
  currentFilter = "done";
  currentPage = 1;
  localStorage.setItem("currentFilter", "done");
  setActiveFilterButton("done");
  fetchTasks(currentPage, tasksPerPage);
});

const setActiveFilterButton = (filter) => {
  allTasksButton.classList.remove("active-filter");
  activeTasksButton.classList.remove("active-filter");
  doneTasksButton.classList.remove("active-filter");

  if (filter === "all") {
    allTasksButton.classList.add("active-filter");
  } else if (filter === "active") {
    activeTasksButton.classList.add("active-filter");
  } else if (filter === "done") {
    doneTasksButton.classList.add("active-filter");
  }
};

setActiveFilterButton(currentFilter);

const fetchTasks = async (page, limit) => {
  try {
    const modifiedURL = new URL(url + "tasks");
    modifiedURL.searchParams.append("sortBy", "deadline");
    modifiedURL.searchParams.append("order", "asc");
    
    modifiedURL.searchParams.append("page", page || 1);
    modifiedURL.searchParams.append("limit", limit || 5);
    
    if (currentFilter !== "all") {
      modifiedURL.searchParams.append("filter", currentFilter === "active" ? "true" : "false");
    }

    const response = await fetch(modifiedURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const tasks = await response.json();
    
    if (page === 1) {
      allTasks = tasks;
    } else {
      allTasks = allTasks.concat(tasks);
    }

    document.getElementById("count-all-tasks").textContent =
      allTasks.filter((task) => !task.active).length + "/" + allTasks.length;
    document.getElementById("count-active-tasks").textContent = allTasks.filter(
      (task) => task.active
    ).length;
    document.getElementById("count-done-tasks").textContent = allTasks.filter(
      (task) => !task.active
    ).length;

    renderTasks(allTasks, currentFilter);
    
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (tasks.length < limit) {
      loadMoreBtn.classList.add("d-none");
    } else {
      loadMoreBtn.classList.remove("d-none");
    }
  } catch (error) {
    console.error(error);
  }

  console.log(allTasks);
};

const createTask = async (taskTitle, taskDescription, deadline) => {
  try {
    let deadlineDate = new Date();
    if (deadline) {
      deadlineDate = new Date(deadline);
    } else {
      deadlineDate.setDate(deadlineDate.getDate() + 7);
    }

    const response = await fetch(url + "tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createdAt: new Date().toISOString(),
        title: taskTitle,
        description: taskDescription,
        active: true,
        deadline: deadlineDate.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const newTask = await response.json();
    allTasks.push(newTask);
    allTasks = allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
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
    allTasks = allTasks.filter((task) => task.id !== id);
    renderTasks(allTasks, currentFilter);
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
    const taskIndex = allTasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      allTasks[taskIndex].active = isActive;
    }
    renderTasks(allTasks, currentFilter);
  } catch (error) {
    console.error(error);
  }
};

const updateTask = async (id, title, description, deadline) => {
  try {
    let deadlineDate;
    if (deadline) {
      deadlineDate = new Date(deadline).toISOString();
    }

    const body = { title, description };
    if (deadlineDate) {
      body.deadline = deadlineDate;
    }

    const response = await fetch(url + "tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const taskIndex = allTasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      allTasks[taskIndex].title = title;
      allTasks[taskIndex].description = description;
      if (deadlineDate) {
        allTasks[taskIndex].deadline = deadlineDate;
      }
    }
    allTasks = allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    renderTasks(allTasks, currentFilter);
  } catch (error) {
    console.error(error);
  }
};

const renderTasks = (tasks, filter = currentFilter) => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (filter === "active") {
    tasks = tasks.filter(task => task.active);
  } else if (filter === "done") {
    tasks = tasks.filter(task => !task.active);
  }

  const fragment = document.createDocumentFragment();
  const modalsFragment = document.createDocumentFragment();

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
      }
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

    const modalId = `modal-${task.id}`;
    const modal = `
<div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="modalLabel-${task.id}" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalLabel-${task.id}">Delete</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
        </button>
      </div>
      <div class="modal-body">
        Do you really want to delete your task?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary delete-modal-btn" data-bs-dismiss="modal" data-task-id="${task.id}">Delete</button>
      </div>
    </div>
  </div>
</div>`;
    const modalFragment = document
      .createRange()
      .createContextualFragment(modal);
    modalsFragment.appendChild(modalFragment);

    const modalButton = document.createElement("button");
    modalButton.type = "button";
    modalButton.className = "btn btn-outline-danger btn-sm";
    modalButton.setAttribute("data-bs-toggle", "modal");
    modalButton.setAttribute("data-bs-target", `#${modalId}`);
    modalButton.textContent = "delete";

    const edit = document.createElement("button");
    edit.textContent = "edit";
    edit.classList.add("btn", "btn-outline-secondary", "btn-sm");
    edit.addEventListener("click", function () {
      editingTaskId = task.id;
      taskTitle.value = task.title;
      taskDescription.value = task.description;
      taskDeadline.value = new Date(task.deadline).toISOString().split("T")[0];
      openEditor();
    });

    const buttons = document.createElement("div");
    buttons.classList.add("task-buttons");
    buttons.appendChild(modalButton);
    buttons.appendChild(edit);

    div.appendChild(buttons);

    const deadline = document.createElement("input");
    deadline.type = "date";

    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        deadline.value = deadlineDate.toISOString().split("T")[0];
      }
    }

    deadline.disabled = true;
    deadline.className = "form-control";
    div.appendChild(deadline);

    fragment.appendChild(div);

    anime({
      targets: div,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 300,
      easing: "easeOutCubic",
    });
  });

  document.body.appendChild(modalsFragment);
  taskList.appendChild(fragment);
};

document.getElementById("load-more-btn").addEventListener("click", function() {
  currentPage++;
  fetchTasks(currentPage, tasksPerPage);
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-modal-btn")) {
    const taskId = e.target.getAttribute("data-task-id");
    if (taskId) {
      deleteTask(taskId);
    }
  }
});

fetchTasks();