const loginPage = document.getElementById("login-page");
const dashboardPage = document.getElementById("dashboard-page");

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

const currentUserElement = document.getElementById("current-user");
const logoutButton = document.getElementById("logout-btn");

const usersBody = document.getElementById("users-body");
const message = document.getElementById("message");

const modal = document.getElementById("user-modal");
const form = document.getElementById("user-form");

const userIdInput = document.getElementById("user-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirm-password");

const passwordGroup = document.getElementById("password-group");
const confirmPasswordGroup =
    document.getElementById("confirm-password-group");

const modalTitle = document.getElementById("modal-title");

const createUserButton =
    document.getElementById("create-user-btn");

const closeModalButton =
    document.getElementById("close-modal");

const cancelButton =
    document.getElementById("cancel-btn");

const TOKEN_KEY = "sdet_access_token";

let currentUser = null;


/* =========================================================
   Authentication
========================================================= */

async function login(email, password) {
    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    });

    if (!response.ok) {
        let message = "Invalid email or password";

        try {
            const error = await response.json();
            message = error.detail || message;
        } catch {
            // Ignore non-JSON response.
        }

        throw new Error(message);
    }

    const data = await response.json();

    localStorage.setItem(
        TOKEN_KEY,
        data.access_token
    );
}


async function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return null;
    }

    const response = await fetch("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }

    return await response.json();
}


/* =========================================================
   API Helper
========================================================= */

async function apiFetch(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        showLoginPage();
        throw new Error("Authentication required");
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
    }

    return response;
}


/* =========================================================
   UI State
========================================================= */

function showLoginPage() {
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");
}


function showDashboard() {
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
}


function logout() {
    localStorage.removeItem(TOKEN_KEY);

    currentUser = null;

    usersBody.innerHTML = "";

    showLoginPage();
}


/* =========================================================
   Dashboard
========================================================= */

async function initializeDashboard() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        showLoginPage();
        return;
    }

    currentUser = await getCurrentUser();

    if (!currentUser) {
        showLoginPage();
        return;
    }

    currentUserElement.textContent =
        `${currentUser.name} (${currentUser.role})`;

    applyRolePermissions();

    showDashboard();

    await loadUsers();
}


function applyRolePermissions() {
    if (!currentUser) {
        return;
    }

    if (currentUser.role === "ADMIN") {
        createUserButton.classList.remove("hidden");
    } else {
        createUserButton.classList.add("hidden");
    }
}


/* =========================================================
   Users - Load
========================================================= */

async function loadUsers() {
    try {
        const response = await apiFetch("/users");

        if (!response.ok) {
            const errorMessage =
                await getApiErrorMessage(
                    response,
                    "Failed to load users"
                );

            showMessage(errorMessage, "error");
            return;
        }

        const users = await response.json();

        renderUsers(users);

    } catch (error) {
        showMessage(
            error.message || "Failed to load users",
            "error"
        );
    }
}


/* =========================================================
   Users - Render
========================================================= */

function renderUsers(users) {
    usersBody.innerHTML = "";

    if (!users.length) {
        usersBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }

    users.forEach((user) => {
        const row = document.createElement("tr");

        const actions =
            currentUser &&
                currentUser.role === "ADMIN"
                ? `
                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editUser(${user.id})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteUser(${user.id})"
                    >
                        Delete
                    </button>
                `
                : "";

        row.innerHTML = `
            <td>${escapeHtml(user.id)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.status)}</td>
            <td>${actions}</td>
        `;

        usersBody.appendChild(row);
    });
}


/* =========================================================
   Create User
========================================================= */

function openCreateModal() {
    modalTitle.textContent = "Create User";

    form.reset();

    userIdInput.value = "";

    passwordGroup.classList.remove("hidden");
    confirmPasswordGroup.classList.remove("hidden");

    passwordInput.required = true;
    confirmPasswordInput.required = true;

    modal.classList.remove("hidden");
}


/* =========================================================
   Edit User
========================================================= */

async function editUser(userId) {
    try {
        const response = await apiFetch(
            `/users/${userId}`
        );

        if (!response.ok) {
            const errorMessage =
                await getApiErrorMessage(
                    response,
                    "Failed to load user"
                );

            showMessage(errorMessage, "error");
            return;
        }

        const user = await response.json();

        modalTitle.textContent = "Edit User";

        userIdInput.value = user.id;
        nameInput.value = user.name;
        emailInput.value = user.email;

        passwordInput.value = "";
        confirmPasswordInput.value = "";

        passwordGroup.classList.add("hidden");
        confirmPasswordGroup.classList.add("hidden");

        passwordInput.required = false;
        confirmPasswordInput.required = false;

        modal.classList.remove("hidden");

    } catch (error) {
        showMessage(
            error.message || "Failed to load user",
            "error"
        );
    }
}


/* =========================================================
   Delete User
========================================================= */

async function deleteUser(userId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await apiFetch(
            `/users/${userId}`,
            {
                method: "DELETE",
            }
        );

        if (response.status === 204) {
            showMessage(
                "User deleted successfully",
                "success"
            );

            await loadUsers();

            return;
        }

        const errorMessage =
            await getApiErrorMessage(
                response,
                "Failed to delete user"
            );

        showMessage(errorMessage, "error");

    } catch (error) {
        showMessage(
            error.message || "Failed to delete user",
            "error"
        );
    }
}


/* =========================================================
   Save User - Create / Update
========================================================= */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = userIdInput.value.trim();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name) {
        showMessage("Name is required", "error");
        return;
    }

    if (!email) {
        showMessage("Email is required", "error");
        return;
    }

    /*
     * CREATE USER
     */
    if (!userId) {
        if (!password) {
            showMessage(
                "Password is required",
                "error"
            );

            return;
        }

        if (password.length < 8) {
            showMessage(
                "Password must contain at least 8 characters",
                "error"
            );

            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                "Passwords do not match",
                "error"
            );

            return;
        }
    }

    /*
     * CREATE payload
     *
     * confirm-password is NOT sent to API.
     */
    const payload = {
        name,
        email,
    };

    if (!userId) {
        payload.password = password;
    }

    try {
        let response;

        if (!userId) {
            response = await apiFetch(
                "/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );
        } else {
            response = await apiFetch(
                `/users/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );
        }

        if (!response.ok) {
            const errorMessage =
                await getApiErrorMessage(
                    response,
                    "Operation failed"
                );

            showMessage(errorMessage, "error");

            return;
        }

        modal.classList.add("hidden");

        form.reset();

        await loadUsers();

        showMessage(
            userId
                ? "User updated successfully"
                : "User created successfully",
            "success"
        );

    } catch (error) {
        showMessage(
            error.message || "Operation failed",
            "error"
        );
    }
});


/* =========================================================
   Login Event
========================================================= */

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginError.textContent = "";
    loginError.style.display = "none";

    const email =
        document.getElementById("login-email")
            .value
            .trim();

    const password =
        document.getElementById("login-password")
            .value;

    try {
        await login(email, password);

        loginForm.reset();

        await initializeDashboard();

    } catch (error) {
        loginError.textContent =
            error.message || "Login failed";

        loginError.style.display = "block";
    }
});


/* =========================================================
   Logout
========================================================= */

logoutButton.addEventListener("click", () => {
    modal.classList.add("hidden");
    logout();
});


/* =========================================================
   Modal
========================================================= */

createUserButton.addEventListener(
    "click",
    openCreateModal
);


closeModalButton.addEventListener(
    "click",
    () => {
        modal.classList.add("hidden");
        form.reset();
    }
);


cancelButton.addEventListener(
    "click",
    () => {
        modal.classList.add("hidden");
        form.reset();
    }
);


/* =========================================================
   Messages
========================================================= */

function showMessage(text, type = "info") {
    message.textContent = text;

    message.className = `message ${type}`;

    message.style.display = "block";

    setTimeout(() => {
        message.style.display = "none";
    }, 3000);
}


/* =========================================================
   API Error Handling
========================================================= */

async function getApiErrorMessage(
    response,
    fallbackMessage
) {
    try {
        const error = await response.json();

        if (Array.isArray(error.detail)) {
            return error.detail
                .map((item) => {
                    if (typeof item === "string") {
                        return item;
                    }

                    return (
                        item.msg ||
                        "Validation error"
                    );
                })
                .join(", ");
        }

        return error.detail || fallbackMessage;

    } catch {
        return fallbackMessage;
    }
}


/* =========================================================
   HTML Safety
========================================================= */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   Application Startup
========================================================= */

initializeDashboard();
