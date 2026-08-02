# 🚀 SDET Practice Application — Quick Start

> **From zero to a running SDET practice environment in a few minutes.**

This project is a deliberately small but realistic application designed for practicing **Senior SDET automation** across UI, API, database, authentication, authorization, and end-to-end testing.

---

## 🏗️ What You'll Run

```text
                    SDET Practice Application
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
            UI               API               DB
             │                │                │
        HTML/CSS/JS         FastAPI        PostgreSQL
             │                │                │
             └────────────────┼────────────────┘
                              │
                           Docker
```

Later, our automation framework will test:

```text
Playwright ──► UI
HTTPX ──────► API
psycopg ────► PostgreSQL
Pytest ─────► Test Runner
Allure ─────► Reporting
```

---

# 1️⃣ Prerequisites

Install the following:

* Python 3.13+
* Docker Desktop
* Git
* VS Code recommended

Verify:

```bash
python3 --version
docker --version
docker compose version
git --version
```

> On macOS, use `python3` if the `python` command is not available.

---

# 2️⃣ Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd sdet-practice-app
```

---

# 3️⃣ Create Python Virtual Environment

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

Verify:

```bash
which python3
python3 --version
```

You should see the Python executable from your `.venv`.

---

# 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

If you are installing packages manually, remember that Zsh treats square brackets specially.

Use:

```bash
pip install 'psycopg[binary]'
```

instead of:

```bash
pip install psycopg[binary]
```

---

# 5️⃣ Configure Environment

Create `.env` in the project root:

```bash
touch .env
```

Example:

```text
DATABASE_URL=postgresql+psycopg://sdet_user:sdet_password@localhost:5432/sdet_practice
```

Do **not** commit `.env`.

Make sure `.gitignore` contains:

```text
.env
.venv/
__pycache__/
.pytest_cache/
```

---

# 6️⃣ Start PostgreSQL

Start Docker services:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

You should see the PostgreSQL container.

Example:

```text
sdet-postgres
```

---

# 7️⃣ Verify PostgreSQL

Connect to the database:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Inside PostgreSQL:

```sql
\dt
```

You should eventually see:

```text
public | users | table | sdet_user
```

Check the data:

```sql
SELECT * FROM users;
```

Exit:

```sql
\q
```

---

# 8️⃣ Start the Application

With the virtual environment activated:

```bash
uvicorn app.main:app --reload
```

Expected:

```text
Uvicorn running on http://127.0.0.1:8000
```

---

# 9️⃣ Open the Application

Open:

```text
http://127.0.0.1:8000/
```

You should see the SDET Practice Application UI.

---

# 🔟 Verify Health

Open:

```text
http://127.0.0.1:8000/health
```

Expected:

```json
{
  "status": "UP",
  "service": "sdet-practice-app"
}
```

---

# 1️⃣1️⃣ Open API Documentation

FastAPI automatically provides Swagger UI.

Open:

```text
http://127.0.0.1:8000/docs
```

You can use this to manually explore:

```text
Authentication
Users
Create User
Get User
Update User
Delete User
```

You can also access the OpenAPI specification at:

```text
http://127.0.0.1:8000/openapi.json
```

---

# 1️⃣2️⃣ Verify Database

From another terminal:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Then:

```sql
SELECT * FROM users;
```

You should see the users created by the application.

---

# 1️⃣3️⃣ Verify Authentication

The application contains authentication and authorization.

The basic flow is:

```text
Login
  ↓
Credentials
  ↓
Authentication
  ↓
Access Token
  ↓
Authenticated Request
```

Protected endpoints require authentication.

For example:

```text
GET /users
```

without authentication should return:

```text
401 Unauthorized
```

---

# 1️⃣4️⃣ Verify Authorization

The application supports role-based access.

Conceptually:

```text
ADMIN
 ├── View users      ✅
 ├── Create user     ✅
 ├── Update user     ✅
 └── Delete user     ✅


USER
 ├── View users      ✅
 ├── Create user     ❌
 ├── Update user     ❌
 └── Delete user     ❌
```

The exact behavior should always be verified against the current implementation.

---

# 1️⃣5️⃣ Basic Application Flow

Once the application is running:

```text
Login
  ↓
Dashboard
  ↓
Users
  ↓
Create User
  ↓
View User
  ↓
Update User
  ↓
Delete User
  ↓
Logout
```

---

# 1️⃣6️⃣ Verify API → Database

Create a user through Swagger or the UI.

Then query PostgreSQL:

```sql
SELECT *
FROM users
WHERE email = 'your-test-email@example.com';
```

Expected:

```text
API operation
      ↓
201 Created
      ↓
Database record
      ↓
Record can be queried
```

This is the first simple **API → DB validation**.

---

# 1️⃣7️⃣ Run Existing Tests

If tests are available:

```bash
pytest
```

For more verbose output:

```bash
pytest -v
```

---

# 1️⃣8️⃣ Stop the Application

Stop FastAPI with:

```text
CTRL + C
```

Stop Docker:

```bash
docker compose down
```

---

# 1️⃣9️⃣ Completely Reset the Database

⚠️ This deletes the PostgreSQL Docker volume and local database data.

```bash
docker compose down -v
docker compose up -d
```

Use this when you want a completely fresh environment.

---

# ⚡ One-Command Startup Flow

After the initial setup, your normal development workflow becomes:

### Terminal 1 — Database

```bash
docker compose up -d
```

### Terminal 2 — Application

```bash
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Browser

```text
http://127.0.0.1:8000/
```

### Swagger

```text
http://127.0.0.1:8000/docs
```

---

# 🧪 What We'll Automate

This application is intentionally designed to support approximately **30 high-value SDET scenarios**.

```text
             Test Automation
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
      UI          API          DB
       │           │           │
       ▼           ▼           ▼
 Playwright      HTTPX       psycopg
       │           │           │
       └───────────┼───────────┘
                   ▼
                 Pytest
                   │
                   ▼
                Allure
```

---

# 🎯 Core Test Areas

### UI

```text
Login
Users
Create
Update
Delete
Logout
Validation
Authorization
```

### API

```text
POST /users
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
```

### Database

```text
Create persistence
Update persistence
Delete persistence
Data integrity
Password security
```

### Security

```text
Authentication
Authorization
Invalid token
Missing token
Role-based access
```

### E2E

```text
UI → API → DB
```

---

# 🧭 Project Documentation

For deeper information, see:

```text
docs/
├── quick-start.md
├── database-guide.md
├── ui-guide.md
└── test-scenarios.md
```

### Quick Start

This document.

Use it when you just want to get the application running.

### Database Guide

Explains:

```text
PostgreSQL
Docker
SQL
Database validation
API → DB testing
```

### UI Guide

Explains:

```text
Login
Dashboard
Users
CRUD
Authentication
Authorization
Playwright strategy
```

### Test Scenarios

Contains the complete test inventory and expected behavior.

---

# 🏆 Learning Objective

This isn't just a CRUD application.

It is our **Senior SDET practice environment**.

We will use it to demonstrate:

```text
                 SENIOR SDET
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
     UI             API             DB
      │              │              │
      └──────────────┼──────────────┘
                     ▼
              Authentication
                     │
                     ▼
              Authorization
                     │
                     ▼
               Test Design
                     │
                     ▼
                Pytest
                     │
                     ▼
              Test Framework
                     │
                     ▼
                Reporting
                     │
                     ▼
                  CI/CD
```

---

# 🚀 Next Step

Once the application is running successfully, **do not start writing 30 tests manually**.

Our next phase is to build the automation framework itself.

We will start with:

```text
1. Framework architecture
2. Repository structure
3. Configuration management
4. Pytest foundation
5. Fixtures
6. API client
7. Authentication manager
8. Database client
9. UI/Playwright client
10. Assertions
11. Test data management
12. Logging
13. Reporting
14. Parallel execution
15. Retry strategy
16. CI/CD
```

Then we will implement the test scenarios incrementally.

---

## ✅ Quick Health Check

Before moving to framework development, confirm:

```text
☐ Docker is running
☐ PostgreSQL container is running
☐ Database connection works
☐ users table exists
☐ FastAPI starts
☐ /health works
☐ /docs works
☐ UI opens
☐ Login works
☐ ADMIN works
☐ USER authorization works
☐ User CRUD works
☐ Database reflects changes
```

If all of these are working:

```text
        APPLICATION READY ✅
                 ↓
       AUTOMATION FRAMEWORK
                 ↓
          SENIOR SDET 🚀
```
