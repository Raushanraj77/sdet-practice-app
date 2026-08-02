# 🐳 SDET Practice Application — Docker Setup & Troubleshooting Guide

> A practical Docker guide for setting up PostgreSQL, connecting the FastAPI application, validating the database, and troubleshooting common Docker issues encountered during development.

---

# 1. Overview

Docker is used in this project to provide a consistent PostgreSQL environment without requiring PostgreSQL to be installed directly on the developer's machine.

The architecture is:

```text
┌──────────────────────────────────────────────┐
│              Developer Machine               │
│                                              │
│  FastAPI Application                         │
│       │                                      │
│       │ PostgreSQL connection                │
│       ▼                                      │
│  ┌────────────────────────────────────────┐  │
│  │          Docker Container              │  │
│  │                                        │  │
│  │          PostgreSQL                    │  │
│  │                                        │  │
│  │  Database: sdet_practice               │  │
│  │  User:     sdet_user                   │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 2. Prerequisites

Install:

* Docker Desktop
* Docker Compose
* Git
* Python 3.13+

Verify Docker:

```bash
docker --version
```

Example:

```text
Docker version 28.x.x
```

Verify Docker Compose:

```bash
docker compose version
```

Example:

```text
Docker Compose version v2.x.x
```

---

# 3. Docker Project Structure

The practice application uses Docker Compose.

Recommended project structure:

```text
sdet-practice-app/
│
├── app/
│
├── docs/
│
├── docker-compose.yml
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

---

# 4. Docker Compose Configuration

The PostgreSQL service is defined in:

```text
docker-compose.yml
```

Example:

```yaml
services:

  postgres:
    image: postgres:17
    container_name: sdet-postgres

    environment:
      POSTGRES_USER: sdet_user
      POSTGRES_PASSWORD: sdet_password
      POSTGRES_DB: sdet_practice

    ports:
      - "5432:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

This creates:

```text
Container:
sdet-postgres

Database:
sdet_practice

Username:
sdet_user

Password:
sdet_password

Port:
5432
```

---

# 5. Start Docker

From the project root:

```bash
docker compose up -d
```

Explanation:

```text
docker compose
      ↓
Read docker-compose.yml
      ↓
Create PostgreSQL container
      ↓
Start PostgreSQL
      ↓
Run in detached mode
```

The `-d` means:

```text
Detached mode
```

so the terminal remains available.

---

# 6. Verify Container

Run:

```bash
docker ps
```

Expected:

```text
CONTAINER ID   IMAGE         STATUS        NAMES
xxxxxxxxxxxx   postgres:17   Up ...        sdet-postgres
```

The important part is:

```text
sdet-postgres
```

and the container should be running.

---

# 7. Check Container Logs

If the container does not appear healthy:

```bash
docker logs sdet-postgres
```

For live logs:

```bash
docker logs -f sdet-postgres
```

Look for PostgreSQL startup messages indicating that the server is ready to accept connections.

Stop following logs with:

```text
CTRL + C
```

---

# 8. Connect to PostgreSQL

Connect directly inside the Docker container:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Expected:

```text
psql (17.x ...)
Type "help" for help.

sdet_practice=#
```

You are now inside PostgreSQL.

---

# 9. Verify Tables

Inside `psql`:

```sql
\dt
```

Initially, we encountered:

```text
Did not find any relations.
```

This is **not necessarily a Docker problem**.

It means the PostgreSQL database exists, but the application has not yet created any tables.

After the FastAPI application initializes the SQLAlchemy metadata, the `users` table should appear:

```text
 Schema | Name  | Type  | Owner
--------+-------+-------+----------
 public | users | table | sdet_user
```

---

# 10. Verify User Data

Run:

```sql
SELECT * FROM users;
```

Example:

```text
 id |  name  |      email       | status |         created_at
----+--------+------------------+--------+----------------------------
  1 | string | user@example.com | ACTIVE | 2026-08-02 ...
```

This confirms:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
PostgreSQL
   ↓
users table
```

is working.

---

# 11. Exit PostgreSQL

Use:

```sql
\q
```

This returns you to the terminal.

---

# 12. Application Database Configuration

The FastAPI application reads the database connection from `.env`.

Example:

```text
DATABASE_URL=postgresql+psycopg://sdet_user:sdet_password@localhost:5432/sdet_practice
```

Important components:

```text
postgresql+psycopg
        │
        └── SQLAlchemy PostgreSQL driver

sdet_user
        │
        └── Database username

sdet_password
        │
        └── Database password

localhost
        │
        └── Host exposed by Docker

5432
        │
        └── PostgreSQL port

sdet_practice
        │
        └── Database name
```

---

# 13. Important Docker Networking Rule

When FastAPI runs directly on the host machine:

```text
FastAPI
   ↓
localhost:5432
   ↓
Docker PostgreSQL
```

Therefore:

```text
localhost
```

is correct.

However, if FastAPI itself is later moved into Docker Compose, the connection changes.

Instead of:

```text
localhost:5432
```

the application should connect using the Docker service name, for example:

```text
postgres:5432
```

This distinction is important when we eventually containerize the complete SDET practice environment.

---

# 14. Issue #1 — Docker API Connection Error

### Problem

We initially encountered:

```text
failed to connect to the docker API at
unix:///var/run/docker.sock

dial unix /var/run/docker.sock:
connect: no such file or directory
```

### Meaning

The Docker CLI was available, but the Docker daemon was not running or accessible.

The important distinction is:

```text
Docker CLI
    ≠
Docker Engine
```

The command:

```bash
docker --version
```

can work even when the Docker daemon is unavailable.

---

# 15. Solution — Start Docker Desktop

On macOS:

1. Open Docker Desktop.
2. Wait until Docker reports that it is running.
3. Run:

```bash
docker ps
```

If Docker is working, the command should return the running containers instead of a daemon connection error.

Then:

```bash
docker compose up -d
```

should work.

### Verification

```bash
docker info
```

If Docker Engine is available, this command should return Docker environment information.

---

# 16. Issue #2 — PostgreSQL Database Had No Tables

We connected successfully:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Then:

```sql
\dt
```

returned:

```text
Did not find any relations.
```

### Meaning

The PostgreSQL server was working.

The database:

```text
sdet_practice
```

was also working.

But there were no tables yet.

This is different from:

```text
Database connection failure
```

---

# 17. Solution — Start FastAPI / Create Metadata

The application uses SQLAlchemy and initializes the database metadata.

After starting the application:

```bash
uvicorn app.main:app --reload
```

the application creates the required table.

Then reconnect:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Run:

```sql
\dt
```

Expected:

```text
public | users | table | sdet_user
```

Then:

```sql
SELECT * FROM users;
```

---

# 18. Issue #3 — `psycopg` Module Not Found

We encountered:

```text
ModuleNotFoundError: No module named 'psycopg'
```

when running:

```bash
python3 -c "import psycopg; ..."
```

### Meaning

The Python environment being used to execute the command did not have `psycopg` installed.

This is particularly easy to encounter when multiple Python installations exist.

---

# 19. Diagnose Python Environment

Run:

```bash
which python
```

and:

```bash
which python3
```

Then:

```bash
python --version
```

and:

```bash
python3 --version
```

In our environment, `python` was initially unavailable while `python3` pointed to the installed Python 3.13 executable.

---

# 20. Solution — Activate Virtual Environment

Activate the project's virtual environment:

```bash
source .venv/bin/activate
```

Then verify:

```bash
which python
```

and:

```bash
python --version
```

The Python executable should now point into:

```text
.venv/
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Verify:

```bash
pip show psycopg
```

Then:

```bash
python -c "import psycopg; print('PSYCOPG IMPORT SUCCESS')"
```

Expected:

```text
PSYCOPG IMPORT SUCCESS
```

---

# 21. Issue #4 — Zsh `no matches found: psycopg[binary]`

We initially tried:

```bash
pip install psycopg[binary]
```

and macOS Zsh returned:

```text
zsh: no matches found: psycopg[binary]
```

### Why?

Zsh interprets square brackets as shell pattern syntax.

Therefore the command is interpreted by the shell before `pip` receives it.

---

# 22. Solution — Quote the Package Name

Use:

```bash
pip install 'psycopg[binary]'
```

or:

```bash
pip install "psycopg[binary]"
```

Both prevent Zsh from interpreting the square brackets.

For this project, however, the preferred approach is:

```bash
pip install -r requirements.txt
```

where the dependency is already declared as:

```text
psycopg[binary]
```

---

# 23. Issue #5 — `python` Command Not Found

We encountered:

```text
zsh: command not found: python
```

while:

```bash
python3 --version
```

worked.

### Solution

On macOS, use:

```bash
python3
```

or create/activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

After activation, normally:

```bash
python
```

should point to the virtual environment's Python interpreter.

Verify:

```bash
which python
python --version
```

---

# 24. Issue #6 — Database Connection Test

A direct database connection can be tested with:

```bash
python3 -c "import psycopg; conn=psycopg.connect('postgresql://sdet_user:sdet_password@localhost:5432/sdet_practice'); print('DATABASE CONNECTION SUCCESS'); conn.close()"
```

Expected:

```text
DATABASE CONNECTION SUCCESS
```

If this fails, check in this order:

```text
1. Docker Desktop running?
        ↓
2. PostgreSQL container running?
        ↓
3. Port 5432 exposed?
        ↓
4. Database exists?
        ↓
5. Username/password correct?
        ↓
6. psycopg installed?
        ↓
7. Correct Python environment?
```

---

# 25. Useful Docker Commands

### List running containers

```bash
docker ps
```

### List all containers

```bash
docker ps -a
```

### Start services

```bash
docker compose up -d
```

### Stop services

```bash
docker compose down
```

### Restart services

```bash
docker compose restart
```

### View logs

```bash
docker logs sdet-postgres
```

### Follow logs

```bash
docker logs -f sdet-postgres
```

### Enter PostgreSQL

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

---

# 26. Database Reset

If the database needs to be completely recreated:

```bash
docker compose down -v
```

Then:

```bash
docker compose up -d
```

### ⚠️ Warning

The `-v` option removes Docker volumes.

That means existing PostgreSQL data will be deleted.

Use this only when you intentionally want a clean database.

---

# 27. Check Docker Volume

List volumes:

```bash
docker volume ls
```

Inspect a volume:

```bash
docker volume inspect <volume-name>
```

The PostgreSQL data is persisted through the volume configured in `docker-compose.yml`.

---

# 28. Check Port 5432

If PostgreSQL cannot be reached from the host, check whether something is already using port `5432`.

macOS/Linux:

```bash
lsof -i :5432
```

If another PostgreSQL installation is already running on that port, Docker may fail to bind:

```text
5432:5432
```

In that case, either stop the conflicting service or use another host port.

Example:

```yaml
ports:
  - "5433:5432"
```

Then the host connection becomes:

```text
localhost:5433
```

while PostgreSQL inside the container continues to listen on:

```text
5432
```

---

# 29. Docker Troubleshooting Flow

When the application cannot connect to PostgreSQL:

```text
              Application Error
                     │
                     ▼
             Is Docker running?
                /        \
              NO          YES
              │            │
              ▼            ▼
       Start Docker     docker ps
                           │
                           ▼
                   Container running?
                      /          \
                    NO            YES
                    │              │
                    ▼              ▼
             docker compose     Check logs
              up -d                 │
                                    ▼
                             Check PostgreSQL
                                    │
                                    ▼
                              Check database
                                    │
                                    ▼
                              Check credentials
                                    │
                                    ▼
                              Check Python
                              + psycopg
```

---

# 30. Complete Startup Procedure

For normal development:

### Step 1 — Activate environment

```bash
source .venv/bin/activate
```

### Step 2 — Start PostgreSQL

```bash
docker compose up -d
```

### Step 3 — Verify container

```bash
docker ps
```

### Step 4 — Start FastAPI

```bash
uvicorn app.main:app --reload
```

### Step 5 — Open UI

```text
http://127.0.0.1:8000/
```

### Step 6 — Open Swagger

```text
http://127.0.0.1:8000/docs
```

### Step 7 — Verify database

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Then:

```sql
\dt
```

and:

```sql
SELECT * FROM users;
```

---

# 31. Complete Shutdown Procedure

Stop FastAPI:

```text
CTRL + C
```

Stop PostgreSQL:

```bash
docker compose down
```

Do **not** use:

```bash
docker compose down -v
```

unless you intentionally want to delete the database volume.

---

# 32. Docker Health Checklist

Before starting SDET automation development:

```text
☐ Docker Desktop running
☐ docker --version works
☐ docker compose version works
☐ docker compose up -d works
☐ sdet-postgres container running
☐ PostgreSQL accepts connections
☐ sdet_practice database exists
☐ users table exists
☐ SELECT * FROM users works
☐ psycopg import works
☐ FastAPI connects to PostgreSQL
☐ UI loads successfully
☐ /health works
☐ /docs works
```

---

# 33. Key Lessons From Our Setup

The issues encountered during setup provide useful troubleshooting lessons.

### Docker CLI vs Docker Engine

```text
docker command available
        ≠
Docker daemon running
```

### Database vs Tables

```text
Database exists
        ≠
Tables exist
```

### Python Installation vs Virtual Environment

```text
Python installed
        ≠
Package installed in current environment
```

### Shell vs pip

```text
Shell syntax
        ↓
pip command
```

Special characters such as `[]` may need quoting.

### Host vs Container Networking

```text
Host application
        ↓
localhost:5432

Container application
        ↓
postgres:5432
```

These distinctions will become especially important when we containerize the entire automation environment.

---

# 34. Future Docker Architecture

Currently:

```text
Mac
 │
 ├── FastAPI
 │
 └── Docker
      └── PostgreSQL
```

Eventually, our complete environment can become:

```text
Docker Compose
│
├── app
│    └── FastAPI
│
├── postgres
│    └── PostgreSQL
│
└── automation
     └── Pytest + Playwright
```

Potential future architecture:

```text
                    Docker Compose
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
      App              Database         Automation
        │                 │                 │
     FastAPI          PostgreSQL      Pytest/Playwright
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                       Reports
```

We will introduce this only after the local automation framework is stable.

---

# 35. Recommended Git Files

Docker-related files should include:

```text
docker-compose.yml
.env.example
.gitignore
docs/docker-setup.md
```

`.env` should **never** be committed.

Instead, provide:

```text
.env.example
```

Example:

```text
DATABASE_URL=postgresql+psycopg://sdet_user:sdet_password@localhost:5432/sdet_practice
```

Then a new developer can run:

```bash
cp .env.example .env
```

and configure their local environment.

---

# 36. Final Quick Reference

```text
START
docker compose up -d

CHECK
docker ps

LOGS
docker logs sdet-postgres

CONNECT
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice

TABLES
\dt

DATA
SELECT * FROM users;

EXIT
\q

STOP
docker compose down

RESET DATABASE
docker compose down -v
docker compose up -d
```

---

# 37. Definition of Done

Docker setup is considered complete when:

```text
Docker
   ↓
PostgreSQL
   ↓
Database
   ↓
FastAPI
   ↓
SQLAlchemy
   ↓
Users table
   ↓
UI/API
```

all work together successfully.

The environment is then ready for the next stage:

```text
Docker + Application
          ↓
SDET Automation Framework
          ↓
UI + API + DB
          ↓
Pytest
          ↓
Playwright
          ↓
Allure
          ↓
CI/CD
```

---

## 🚀 Next Step

With Docker, PostgreSQL, FastAPI, UI, authentication, authorization, and the test scenarios documented, the **practice application foundation is complete**.

The next major deliverable should be:

```text
docs/architecture.md
```

This will define the architecture of the **automation framework itself** before we create its folders and start writing automation code.
