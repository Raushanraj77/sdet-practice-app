# 🚀 SDET Practice Application

> **A production-style System Under Test (SUT) built for Senior SDET preparation — API + UI + Database + Authentication + Authorization.**

A lightweight, containerized practice application designed to help SDETs build and demonstrate **real-world automation engineering skills** rather than isolated test scripts.

The application intentionally combines:

**REST API + Web UI + PostgreSQL + JWT Authentication + RBAC**

so that a complete automation framework can be built around a realistic application.

---

## 🔐 Demo Access

The SDET Practice App provides dedicated demo accounts
for the QA community.

| Role | Username | Password |
|------|----------|----------|
| Admin | Admin@test.com | Admin@123 |

These accounts are intended only for testing and automation practice.
Do not use them for production or sensitive data.

## ✨ What Are We Building?

This project is more than a demo application.

It is a **controlled System Under Test (SUT)** for building a professional Senior SDET automation framework.

```text
                    🧪 SDET AUTOMATION
                           │
              ┌────────────┼────────────┐
              │            │            │
             UI           API           DB
              │            │            │
        Playwright       HTTPX      PostgreSQL
              │            │            │
              └────────────┼────────────┘
                           │
                    🔐 Authentication
                           │
                    🛡️ Authorization
                           │
                     👥 RBAC / Roles
                           │
                     📊 Reporting
                           │
                      ⚙️ CI / CD
```

### 🎯 The Goal

Build a complete automation ecosystem capable of validating:

* UI behavior
* REST APIs
* Database state
* Authentication
* Authorization
* Role-based access control
* End-to-end workflows
* Positive and negative scenarios
* API → DB consistency
* UI → API → DB workflows

---

# ⚡ Quick Start

Want to get the application running immediately?

Follow these steps.

### 1️⃣ Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd sdet-practice-app
```

### 2️⃣ Create Virtual Environment

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows**

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

> 💡 **macOS / zsh:** If installing psycopg manually, use quotes:
>
> ```bash
> pip install "psycopg[binary]"
> ```

### 4️⃣ Configure Environment

Create `.env`:

```env
DATABASE_URL=postgresql+psycopg://sdet_user:sdet_password@localhost:5432/sdet_practice

JWT_SECRET_KEY=change-this-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5️⃣ Start PostgreSQL 🐘

Make sure Docker Desktop is running:

```bash
docker compose up -d
```

Verify:

```bash
docker compose ps
```

### 6️⃣ Start FastAPI 🚀

```bash
uvicorn app.main:app --reload
```

Application:

**http://127.0.0.1:8000**

### 7️⃣ Verify Health ❤️

Open:

**http://127.0.0.1:8000/health**

Expected:

```json
{
  "status": "UP",
  "service": "sdet-practice-app"
}
```

### 8️⃣ Open the Application 🖥️

**Web UI**

http://127.0.0.1:8000/

**Swagger API**

http://127.0.0.1:8000/docs

---

# 🗺️ Application Flow

```text
                    🌐 WEB UI
                       │
                       ▼
                 🔐 LOGIN
                       │
                       ▼
                🎟️ JWT TOKEN
                       │
                       ▼
              🛡️ AUTHORIZATION
                       │
              ┌────────┴────────┐
              │                 │
           👑 ADMIN            👤 USER
              │                 │
        Full Access         Limited Access
              │                 │
              └────────┬────────┘
                       │
                       ▼
                  ⚡ FASTAPI
                       │
                       ▼
                 🐘 POSTGRESQL
```

---

# 🧩 Core Capabilities

| Capability                | Status |
| ------------------------- | :----: |
| REST API                  |    ✅   |
| Web UI                    |    ✅   |
| PostgreSQL                |    ✅   |
| Docker                    |    ✅   |
| JWT Authentication        |    ✅   |
| Password Hashing          |    ✅   |
| Role-Based Authorization  |    ✅   |
| ADMIN Role                |    ✅   |
| USER Role                 |    ✅   |
| CRUD Operations           |    ✅   |
| API → DB Validation       |    ✅   |
| UI → API Integration      |    ✅   |
| Negative Scenarios        |    ✅   |
| Test Automation Framework |   🚧   |
| Playwright Automation     |   🚧   |
| API Automation            |   🚧   |
| DB Automation             |   🚧   |
| Allure Reporting          |   🚧   |
| CI/CD                     |   🚧   |

> **Legend:** ✅ Available · 🚧 Planned

---

# 🔐 Authentication & Authorization

The application uses:

```text
OAuth2 Password Flow
        ↓
JWT Access Token
        ↓
Bearer Authentication
        ↓
Role-Based Authorization
```

### 👑 ADMIN

Can:

```text
✅ Login
✅ View users
✅ Create users
✅ Update users
✅ Delete users
```

### 👤 USER

Can:

```text
✅ Login
✅ View users
✅ View user details

❌ Create users
❌ Update users
❌ Delete users
```

### Authorization Matrix

| Operation            | 👑 ADMIN | 👤 USER |
| -------------------- | :------: | :-----: |
| Login                |     ✅    |    ✅    |
| GET `/users`         |     ✅    |    ✅    |
| GET `/users/{id}`    |     ✅    |    ✅    |
| POST `/users`        |     ✅    |    ❌    |
| PUT `/users/{id}`    |     ✅    |    ❌    |
| DELETE `/users/{id}` |     ✅    |    ❌    |

This gives us excellent scenarios for testing:

```text
401 Unauthorized
403 Forbidden
422 Validation Error
404 Not Found
409 Conflict
```

---

# 🧪 Why This Is Excellent for SDET Practice

Instead of practicing isolated tests:

```text
❌ "Write a login test"
❌ "Write a SQL query"
❌ "Write an API test"
```

we practice **real engineering workflows**.

### Example — API + Database

```text
POST /users
      │
      ▼
  201 Created
      │
      ▼
 PostgreSQL
      │
      ▼
SELECT user
      │
      ▼
Compare API ↔ DB
```

### Example — UI + API

```text
UI Login
   │
   ▼
POST /auth/login
   │
   ▼
JWT
   │
   ▼
Dashboard
   │
   ▼
GET /users
```

### Example — Complete E2E

```text
UI
 │
 ├── Login
 │
 ├── Create User
 │
 ▼
API
 │
 ├── POST /users
 │
 ▼
Database
 │
 └── Validate User
```

This is the type of workflow expected from a **Senior SDET**, not just a UI automation engineer.

---

# 🏗️ Technology Stack

### Backend

* 🐍 Python
* ⚡ FastAPI
* 🗃️ SQLAlchemy
* ✅ Pydantic
* 🚀 Uvicorn
* 🔐 JWT
* 🔒 Argon2

### Database

* 🐘 PostgreSQL
* 🐳 Docker

### Frontend

* HTML
* CSS
* JavaScript
* Jinja2

### Planned Automation

* 🧪 Pytest
* 🎭 Playwright
* 🌐 HTTPX
* 🐘 psycopg
* 📊 Allure
* 🔄 GitHub Actions
* 🐳 Docker

---

# 📁 Project Structure

```text
sdet-practice-app/
│
├── app/
│   ├── main.py
│   ├── database.py
│   │
│   ├── models/
│   │   └── user.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   └── users.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   └── user.py
│   │
│   ├── security/
│   │   └── auth.py
│   │
│   ├── services/
│   │   └── auth_service.py
│   │
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   │
│   └── templates/
│       └── index.html
│
├── docker-compose.yml
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

---

# 🐘 Database Access

Connect to PostgreSQL:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

List tables:

```sql
\dt
```

View users:

```sql
SELECT
    id,
    name,
    email,
    role,
    status
FROM users;
```

Check password hashing:

```sql
SELECT
    email,
    password_hash
FROM users;
```

Passwords must **never** be stored in plain text.

---

# 🔎 API → Database Validation

Create a user through the API:

```json
{
  "name": "Database Validation User",
  "email": "dbvalidation@test.com",
  "password": "Test@123"
}
```

Then validate PostgreSQL:

```sql
SELECT
    id,
    name,
    email,
    role,
    status,
    password_hash
FROM users
WHERE email = 'dbvalidation@test.com';
```

Expected:

```text
API Response
     │
     ▼
PostgreSQL Record
     │
     ▼
Field-by-field Validation
     │
     ▼
✅ PASS / ❌ FAIL
```

---

# 🧪 Recommended Automation Scenarios

## 🔐 Authentication

```text
AUTH-001  Valid login
AUTH-002  Invalid password
AUTH-003  Invalid email
AUTH-004  Missing token
AUTH-005  Invalid token
AUTH-006  Expired token
```

## 🛡️ Authorization

```text
AUTHZ-001  ADMIN creates user
AUTHZ-002  USER cannot create user
AUTHZ-003  ADMIN updates user
AUTHZ-004  USER cannot update user
AUTHZ-005  ADMIN deletes user
AUTHZ-006  USER cannot delete user
```

## 👥 User CRUD

```text
USER-001  Create user
USER-002  Get users
USER-003  Get user by ID
USER-004  Update user
USER-005  Delete user
USER-006  Duplicate email
USER-007  Non-existing user
```

## 🐘 Database

```text
DB-001  Validate created user
DB-002  Validate updated user
DB-003  Validate deleted user
DB-004  Validate password hashing
DB-005  Validate default role
DB-006  Validate default status
```

## 🖥️ UI

```text
UI-001  ADMIN login
UI-002  USER login
UI-003  Invalid login
UI-004  ADMIN dashboard
UI-005  USER dashboard
UI-006  Create user
UI-007  Update user
UI-008  Delete user
UI-009  USER restrictions
UI-010  Logout
```

---

# 🧠 Senior SDET Learning Roadmap

The project will evolve in stages.

```text
                 🏁 START
                    │
                    ▼
             Manual Testing
                    │
                    ▼
             🌐 API Automation
                    │
                    ▼
             🐘 DB Validation
                    │
                    ▼
             🖥️ UI Automation
                    │
                    ▼
           🔗 API + UI + DB
                    │
                    ▼
          🏗️ Framework Design
                    │
                    ▼
             🧪 Pytest
                    │
                    ▼
            📊 Allure Reports
                    │
                    ▼
           ⚡ Parallel Testing
                    │
                    ▼
              🐳 Docker
                    │
                    ▼
             🔄 CI / CD
                    │
                    ▼
              🎯 SENIOR SDET
```

---

# 🏗️ Planned Automation Framework

The final automation project will be separated from the application itself.

```text
sdet-automation-framework/
│
├── tests/
│   ├── api/
│   ├── ui/
│   ├── db/
│   └── e2e/
│
├── framework/
│   ├── api/
│   ├── database/
│   ├── auth/
│   ├── config/
│   ├── fixtures/
│   ├── reporting/
│   └── utils/
│
├── pages/
│
├── test_data/
│
├── conftest.py
├── pytest.ini
└── requirements.txt
```

The objective is to demonstrate:

```text
Clean Architecture
        +
Reusable Components
        +
Reliable Automation
        +
API Testing
        +
UI Testing
        +
Database Validation
        +
Authentication
        +
Authorization
        +
Reporting
        +
CI/CD
```

---

# 🛑 Stop the Application

Stop FastAPI:

```text
CTRL + C
```

Stop PostgreSQL:

```bash
docker compose down
```

---

# ♻️ Reset the Database

⚠️ **Warning:** This deletes the PostgreSQL volume and all application data.

```bash
docker compose down -v
docker compose up -d
```

Use this when you want a completely clean test environment.

---

# 🩺 Troubleshooting

### Docker is not running

```bash
docker ps
```

If Docker cannot connect, start Docker Desktop.

### PostgreSQL is not running

```bash
docker compose ps
docker compose up -d
```

### `psycopg` not found

```bash
source .venv/bin/activate
pip install "psycopg[binary]"
```

Verify:

```bash
python3 -c "import psycopg; print(psycopg.__version__)"
```

### UI returns `401`

Clear the stored token:

```javascript
localStorage.removeItem("sdet_access_token");
location.reload();
```

Then log in again.

---

# 🎯 Project Philosophy

> **Don't just write tests. Build an automation system.**

This application exists to create a realistic environment where an SDET can practice:

```text
Test Design
     +
Automation
     +
Architecture
     +
Debugging
     +
Database Validation
     +
CI/CD
     +
Engineering Practices
```

The ultimate goal is to go from:

**"I can automate tests."**

to:

**"I can design, build, maintain, scale, and explain a production-grade automation framework."**

---

# 🚀 Project Status

```text
Application
████████████████████████████████████████ 100%

Authentication
████████████████████████████████████████ 100%

Authorization
████████████████████████████████████████ 100%

Database
████████████████████████████████████████ 100%

UI
████████████████████████████████████████ 100%

API Automation
████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 40%

UI Automation
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%

DB Automation
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%

Framework
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%

CI/CD
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
```

> 🚧 **This project is intentionally evolving.**
>
> The application is the foundation. The real objective is to build the **Senior SDET automation framework around it**.

---

# ⭐ If You Find This Useful

This project is primarily created for learning and Senior SDET interview preparation.

If you find the approach useful, consider giving the repository a ⭐ and following the project as the automation framework evolves.

---

## 🏁 Final Objective

```text
             SDET PRACTICE APPLICATION
                       │
                       ▼
              REALISTIC SYSTEM
                       │
                       ▼
               AUTOMATION FRAMEWORK
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
         API           UI           DB
          │            │            │
          └────────────┼────────────┘
                       ▼
                E2E VALIDATION
                       │
                       ▼
                REPORTING + CI/CD
                       │
                       ▼
             🚀 SENIOR SDET READY
```

**Build it. Break it. Automate it. Explain it.** 🚀
