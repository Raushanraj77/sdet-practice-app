const loginPage = document.getElementById("login-page");
const dashboardPage = document.getElementById("dashboard-page");

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

const currentUserElement =
    document.getElementById("current-user");

const logoutButton =
    document.getElementById("logout-btn");

const usersBody =
    document.getElementById("users-body");

const message =
    document.getElementById("message");

const modal =
    document.getElementById("user-modal");

const form =
    document.getElementById("user-form");

const userIdInput =
    document.getElementById("user-id");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const modalTitle =
    document.getElementById("modal-title");

const createUserButton =
    document.getElementById("create-user-btn");

const closeModalButton =
    document.getElementById("close-modal");

const cancelButton =
    document.getElementById("cancel-btn");


const TOKEN_KEY = "sdet_access_token";

let currentUser = null;


/* =========================
   Authentication
========================= */

async function login(email, password) {

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(
        "/auth/login",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: formData
        }
    );

    if (!response.ok) {

        throw new Error(
            "Invalid email or password"
        );
    }

    const data = await response.json();

    localStorage.setItem(
        TOKEN_KEY,
        data.access_token
    );
}


async function getCurrentUser() {

    const token =
        localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return null;
    }

    const response = await fetch(
        "/auth/me",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        localStorage.removeItem(
            TOKEN_KEY
        );

        return null;
    }

    return await response.json();
}


/* =========================
   API Helper
========================= */

async function apiFetch(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(TOKEN_KEY);

    if (!token) {

        showLoginPage();

        throw new Error(
            "Authentication required"
        );
    }

    const headers = {
        ...(options.headers || {}),
        Authorization:
            `Bearer ${token}`
    };

    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    );

    if (response.status === 401) {

        logout();

        throw new Error(
            "Session expired"
        );
    }

    return response;
}


/* =========================
   UI State
========================= */

function showLoginPage() {

    loginPage.classList.remove("hidden");

    dashboardPage.classList.add("hidden");
}


function showDashboard() {

    loginPage.classList.add("hidden");

    dashboardPage.classList.remove("hidden");
}


function logout() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    currentUser = null;

    usersBody.innerHTML = "";

    showLoginPage();
}


/* =========================
   Dashboard
========================= */

async function initializeDashboard() {

    const token =
        localStorage.getItem(TOKEN_KEY);

    // No token means user is not logged in.
    if (!token) {

        showLoginPage();

        return;
    }

    currentUser =
        await getCurrentUser();

    // Token exists but is invalid/expired.
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

    if (currentUser.role !== "ADMIN") {

        createUserButton.classList.add(
            "hidden"
        );
    }
}


/* =========================
   Users
========================= */

async function loadUsers() {

    const response =
        await apiFetch("/users");

    if (!response.ok) {

        showMessage(
            "Failed to load users"
        );

        return;
    }

    const users =
        await response.json();

    usersBody.innerHTML = "";

    users.forEach(user => {

        const row =
            document.createElement("tr");

        let actions = "";

        if (
            currentUser.role === "ADMIN"
        ) {

            actions = `
                <button
                    class="edit-btn"
                    onclick="editUser(${user.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteUser(${user.id})"
                >
                    Delete
                </button>
            `;
        }

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.status}</td>
            <td>${actions}</td>
        `;

        usersBody.appendChild(row);
    });
}


/* =========================
   Create User
========================= */

function openCreateModal() {

    modalTitle.textContent =
        "Create User";

    form.reset();

    userIdInput.value = "";

    modal.classList.remove(
        "hidden"
    );
}


/* =========================
   Edit User
========================= */

async function editUser(userId) {

    const response =
        await apiFetch(
            `/users/${userId}`
        );

    if (!response.ok) {

        showMessage(
            "Failed to load user"
        );

        return;
    }

    const user =
        await response.json();

    modalTitle.textContent =
        "Edit User";

    userIdInput.value =
        user.id;

    nameInput.value =
        user.name;

    emailInput.value =
        user.email;

    modal.classList.remove(
        "hidden"
    );
}


/* =========================
   Delete User
========================= */

async function deleteUser(userId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this user?"
        );

    if (!confirmed) {
        return;
    }

    const response =
        await apiFetch(
            `/users/${userId}`,
            {
                method: "DELETE"
            }
        );

    if (response.status === 204) {

        showMessage(
            "User deleted successfully"
        );

        await loadUsers();

        return;
    }

    if (response.status === 403) {

        showMessage(
            "You are not authorized to delete users"
        );

        return;
    }

    showMessage(
        "Failed to delete user"
    );
}


/* =========================
   Save User
========================= */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const userId =
            userIdInput.value;

        const payload = {
            name: nameInput.value,
            email: emailInput.value
        };

        let response;

        if (userId) {

            response =
                await apiFetch(
                    `/users/${userId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );

        } else {

            response =
                await apiFetch(
                    "/users",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );
        }

        if (response.ok) {

            modal.classList.add(
                "hidden"
            );

            form.reset();

            await loadUsers();

            showMessage(
                userId
                    ? "User updated successfully"
                    : "User created successfully"
            );

        } else {

            const error =
                await response.json();

            showMessage(
                error.detail ||
                "Operation failed"
            );
        }
    }
);


/* =========================
   Login Event
========================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.style.display =
            "none";

        const email =
            document.getElementById(
                "login-email"
            ).value;

        const password =
            document.getElementById(
                "login-password"
            ).value;

        try {

            await login(
                email,
                password
            );

            loginForm.reset();

            await initializeDashboard();

        } catch (error) {

            loginError.textContent =
                error.message;

            loginError.style.display =
                "block";
        }
    }
);


/* =========================
   Logout
========================= */

logoutButton.addEventListener(
    "click",
    () => {

        modal.classList.add(
            "hidden"
        );

        logout();
    }
);


/* =========================
   Modal
========================= */

createUserButton.addEventListener(
    "click",
    openCreateModal
);

closeModalButton.addEventListener(
    "click",
    () => {
        modal.classList.add(
            "hidden"
        );
    }
);

cancelButton.addEventListener(
    "click",
    () => {
        modal.classList.add(
            "hidden"
        );
    }
);


/* =========================
   Messages
========================= */

function showMessage(text) {

    message.textContent = text;

    message.style.display =
        "block";

    setTimeout(
        () => {
            message.style.display =
                "none";
        },
        3000
    );
}


/* =========================
   Application Startup
========================= */

initializeDashboard();