const url = "https://693e9a3c12c964ee6b6dd5a7.mockapi.io/";

const darkModeBtn = document.getElementById("dark-mode-btn");
const theme = document.getElementById("theme");
let darkMode = localStorage.getItem("dark-mode")

const checkbox = document.getElementById("1");

checkbox.addEventListener("click", () => {
  activeTodo(checkbox.id);
});

const enableDarkMode = () => {
    theme.classList.add("dark-mode-theme");
    darkModeBtn.classList.remove("dark-mode-toggle");
    localStorage.setItem("dark-mode", "enabled");
    }

const disableDarkMode = () => {
     theme.classList.remove("dark-mode-theme");
    darkModeBtn.classList.add("dark-mode-toggle");
    localStorage.setItem("dark-mode", "disabled");
}

if (darkMode === "enabled") {
    enableDarkMode();
} 

darkModeBtn.addEventListener("click", () => {
    darkMode = localStorage.getItem ("dark-mode");
    if (darkMode === "disabled") {
        enableDarkMode();
    }else {
        disableDarkMode();
    }
})

const fetchTasks = async () => {
  try {
    const response = await fetch(url + "tasks");

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const createTask = async () => {
  try {
    const response = await fetch(url + "tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createdAt: new Date().toISOString(),
        title: "Joga",
        description: "Anděl",
        done: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const deleteTask = async (id) => {
    try {
        const response = await fetch(url + "tasks/" + id, {
            method: "DELETE"
        })
    } catch (error){
        console.error(error);
    }
}

const activeTask = async (id) => {
  try {
    const response = await fetch(url + "tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        done: checkbox.checked,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const updateTask = async (id, title, description) => {
  try {
    const response = await fetch(url + "tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:title,
        description:description,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
console.log("ide to ")
