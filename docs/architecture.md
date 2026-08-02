# SDET Practice Application — Architecture

## 1. Overview

The **SDET Practice Application** is a lightweight, containerized web application designed to act as a realistic **System Under Test (SUT)** for Senior SDET automation practice.

The application intentionally combines:

* Web UI
* REST APIs
* PostgreSQL
* Authentication
* JWT-based access tokens
* Authorization
* Role-Based Access Control (RBAC)
* User CRUD operations
* Password hashing
* API-to-database validation opportunities
* UI-to-API workflows

The primary objective is not to build a complex business application.

The objective is to provide a stable application around which a **production-style automation framework** can be developed.

---

# 2. Architecture Overview

At a high level:

```text
                         SDET PRACTICE APPLICATION
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                 Web UI                     REST API
                    │                           │
             HTML / CSS / JS                  FastAPI
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                           Authentication
                                  │
                              JWT Token
                                  │
                           Authorization
                                  │
                           Role-Based Access
                              /       \
                           ADMIN       USER
                              \       /
                               \     /
                              PostgreSQL
```

---

# 3. Application Layers

The application can be viewed as several logical layers.

```text
┌───────────────────────────────────────────┐
│                  UI Layer                 │
│             HTML / CSS / JavaScript       │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│                 API Layer                 │
│                  FastAPI                  │
│              Routes / Endpoints           │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│               Security Layer              │
│        Authentication / Authorization     │
│                  JWT / RBAC               │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│               Data Layer                  │
│             SQLAlchemy ORM               │
│              Database Session              │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│              PostgreSQL                   │
│                Database                   │
└───────────────────────────────────────────┘
```

---

# 4. Technology Architecture

## Backend

The backend is implemented using:

```text
Python
   │
   ├── FastAPI
   ├── SQLAlchemy
   ├── Pydantic
   ├── Uvicorn
   └── psycopg
```

### FastAPI

FastAPI provides:

* REST endpoints
* Request handling
* Dependency injection
* Authentication integration
* Automatic OpenAPI documentation
* Swagger UI

---

## Database

PostgreSQL is used as the relational database.

```text
FastAPI
   │
   ▼
SQLAlchemy
   │
   ▼
psycopg
   │
   ▼
PostgreSQL
```

The database runs inside Docker.

---

## Frontend

The application contains a lightweight web UI using:

```text
HTML
CSS
JavaScript
Jinja2
```

The frontend communicates with the backend REST API.

```text
Browser
   │
   ├── Login
   ├── User Management
   └── Logout
          │
          ▼
       FastAPI
```

---

# 5. Docker Architecture

PostgreSQL is containerized using Docker Compose.

```text
Developer Machine
│
├── FastAPI
│     └── Uvicorn
│
└── Docker
      │
      └── PostgreSQL Container
            │
            └── sdet_practice
```

The application connects to PostgreSQL using the configured `DATABASE_URL`.

Example:

```text
postgresql+psycopg://
sdet_user:
sdet_password@
localhost:
5432/
sdet_practice
```

---

# 6. Project Structure

The current application follows this structure:

```text
sdet-practice-app/
│
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── main.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── users.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   │
│   ├── services/
│   │   └── __init__.py
│   │
│   ├── security/
│   │   ├── __init__.py
│   │   └── auth.py
│   │
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── users.js
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

# 7. Application Entry Point

The main application is created in:

```text
app/main.py
```

The FastAPI application is initialized there.

Conceptually:

```text
app.main
   │
   ├── Create FastAPI application
   │
   ├── Initialize database metadata
   │
   ├── Mount static files
   │
   ├── Configure templates
   │
   ├── Register API routers
   │
   └── Register health endpoint
```

---

# 8. Database Architecture

Database configuration is located in:

```text
app/database.py
```

The database URL is loaded from environment configuration.

```text
.env
 │
 ▼
DATABASE_URL
 │
 ▼
SQLAlchemy Engine
 │
 ▼
SessionLocal
 │
 ▼
FastAPI Dependency
 │
 ▼
Database Session
```

The application uses SQLAlchemy's declarative ORM model.

The base class is:

```python
class Base(DeclarativeBase):
    pass
```

Database sessions are provided to API routes through:

```python
get_db()
```

The session lifecycle is:

```text
Request
   ↓
Create DB Session
   ↓
Execute Query
   ↓
Commit / Read
   ↓
Close Session
```

---

# 9. Data Model

The primary entity is currently:

```text
User
```

The user model is located at:

```text
app/models/user.py
```

The model contains fields such as:

```text
id
name
email
status
created_at
updated_at
```

Authentication-related fields are also used by the security implementation, such as:

```text
password_hash
role
```

Passwords are not intended to be stored as plain text.

---

# 10. Schema Layer

Request and response validation is handled using Pydantic schemas.

Location:

```text
app/schemas/
```

The schema layer separates API contracts from database models.

Conceptually:

```text
HTTP Request
     │
     ▼
Pydantic Schema
     │
     ▼
Application Logic
     │
     ▼
SQLAlchemy Model
     │
     ▼
PostgreSQL
```

For example:

```text
UserCreate
UserUpdate
UserResponse
```

This provides clear separation between:

```text
API Contract
      ≠
Database Model
```

---

# 11. API Route Architecture

User-related API routes are located in:

```text
app/routes/users.py
```

The router uses:

```text
/users
```

as its base path.

The application provides CRUD operations:

```text
POST   /users
GET    /users
GET    /users/{user_id}
PUT    /users/{user_id}
DELETE /users/{user_id}
```

The route layer is responsible for:

* Receiving requests
* Validating request data
* Checking authorization where required
* Accessing the database
* Returning appropriate responses
* Raising HTTP errors

---

# 12. Authentication Architecture

Authentication is implemented using token-based authentication.

The general flow is:

```text
User
 │
 │ username + password
 ▼
Login Endpoint
 │
 ▼
Validate Credentials
 │
 ▼
Generate JWT
 │
 ▼
Return Access Token
```

The client then sends:

```http
Authorization: Bearer <access_token>
```

for protected API requests.

---

# 13. JWT Request Flow

A protected request follows this flow:

```text
Client
  │
  │ Authorization: Bearer JWT
  ▼
FastAPI
  │
  ▼
Extract Token
  │
  ▼
Validate Token
  │
  ▼
Identify User
  │
  ▼
Check Permissions
  │
  ▼
Execute Endpoint
```

Invalid or missing authentication results in:

```text
401 Unauthorized
```

---

# 14. Authorization Architecture

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

The application uses role-based authorization.

The primary roles are:

```text
ADMIN
USER
```

Conceptually:

```text
JWT
 │
 ▼
Current User
 │
 ▼
Role
 │
 ├── ADMIN
 │     └── Full User Management
 │
 └── USER
       └── Restricted Access
```

---

# 15. Role-Based Access Control

The authorization model is:

| Operation         | ADMIN | USER |
| ----------------- | :---: | :--: |
| Login             |   ✅   |   ✅  |
| View users        |   ✅   |   ✅  |
| View user details |   ✅   |   ✅  |
| Create user       |   ✅   |   ❌  |
| Update user       |   ✅   |   ❌  |
| Delete user       |   ✅   |   ❌  |

This gives the automation framework realistic authorization scenarios.

---

# 16. HTTP Security Behavior

The application intentionally supports different security responses.

### Missing / invalid authentication

```text
401 Unauthorized
```

Example:

```text
GET /users
Authorization: <missing>
```

Expected:

```text
401
```

### Authenticated but insufficient permissions

```text
403 Forbidden
```

Example:

```text
USER
  ↓
DELETE /users/5
  ↓
403 Forbidden
```

This distinction is important for API automation.

---

# 17. UI Architecture

The UI is served by FastAPI.

```text
Browser
   │
   ▼
GET /
   │
   ▼
Jinja2 Template
   │
   ▼
index.html
   │
   ├── CSS
   └── JavaScript
```

Static resources are located under:

```text
app/static/
```

Templates are located under:

```text
app/templates/
```

---

# 18. UI → API Communication

The browser interacts with the backend API using JavaScript.

Conceptually:

```text
User Action
    │
    ▼
JavaScript
    │
    ▼
HTTP Request
    │
    ▼
FastAPI
    │
    ▼
PostgreSQL
```

Example:

```text
Login
  ↓
Receive JWT
  ↓
Store access token
  ↓
Use token for protected API requests
```

This provides a realistic target for Playwright automation.

---

# 19. End-to-End Architecture

A complete workflow can involve all three major layers:

```text
                 UI
                  │
                  ▼
             JavaScript
                  │
                  ▼
                API
                  │
                  ▼
          Authentication
                  │
                  ▼
            Authorization
                  │
                  ▼
              Database
```

For example:

```text
ADMIN Login
     │
     ▼
JWT Access Token
     │
     ▼
Create User
     │
     ▼
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
Validate DB
```

This is one of the primary workflows intended for Senior SDET automation practice.

---

# 20. Error Handling

The application uses HTTP status codes to represent different outcomes.

| Status | Meaning          | Example                 |
| -----: | ---------------- | ----------------------- |
|    200 | Success          | GET /users              |
|    201 | Created          | POST /users             |
|    204 | No Content       | DELETE /users/{id}      |
|    401 | Unauthorized     | Missing/invalid token   |
|    403 | Forbidden        | Insufficient role       |
|    404 | Not Found        | User doesn't exist      |
|    409 | Conflict         | Duplicate email         |
|    422 | Validation Error | Invalid request payload |

These responses should become part of the API automation test strategy.

---

# 21. API → Database Relationship

The application provides a useful validation boundary:

```text
API
 │
 │ Create / Update / Delete
 ▼
Application
 │
 ▼
SQLAlchemy
 │
 ▼
PostgreSQL
```

The automation framework can independently query the database:

```text
API Test
   │
   ├── Send API request
   │
   ├── Validate HTTP response
   │
   ├── Query PostgreSQL
   │
   └── Compare API ↔ DB
```

This allows validation of both:

```text
External behavior
+
Internal state
```

---

# 22. Why the Architecture Is Useful for SDET Practice

The application intentionally provides multiple test boundaries.

```text
                SYSTEM UNDER TEST
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
      UI              API              DB
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
                E2E Workflows
```

This enables practice with:

### UI Automation

```text
Playwright
Page Object Model
Fixtures
Authentication
Role-based UI
```

### API Automation

```text
HTTPX
API Client
Authentication
Schema Validation
Status Code Validation
Negative Testing
```

### Database Automation

```text
psycopg
SQL Queries
Data Validation
Data Cleanup
```

### Integration Testing

```text
UI → API → DB
API → DB
```

---

# 23. Target Automation Architecture

The application itself is intentionally kept separate from the future automation framework.

The target architecture is:

```text
sdet-practice-app
        │
        │ System Under Test
        ▼
sdet-automation-framework
        │
        ├── API Tests
        ├── UI Tests
        ├── DB Tests
        └── E2E Tests
```

The future framework will contain:

```text
API Client
Database Client
Authentication Manager
Configuration Manager
Test Data Factory
Pytest Fixtures
Page Objects
Reporting
Logging
CI/CD
```

---

# 24. Target Automation Flow

The final automation solution should support:

```text
                       Pytest
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
            API           UI           DB
             │            │            │
           HTTPX      Playwright     psycopg
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                   E2E Validation
                          │
                          ▼
                     Allure Report
                          │
                          ▼
                     CI / CD
```

---

# 25. Design Principles

The application and future automation framework should follow these principles.

## Separation of Concerns

Keep:

```text
Routes
Schemas
Models
Security
Database
UI
```

separated.

## Reusability

Common functionality should be reusable rather than duplicated.

## Configuration Driven

Environment-specific values should be controlled through environment variables.

## Security

Passwords must not be stored as plain text.

Secrets should not be committed to Git.

## Testability

The application should expose predictable API and database boundaries that can be validated independently.

## Observability

The application should remain easy to diagnose through:

* HTTP responses
* Logs
* Database state
* API documentation

---

# 26. Current Architecture Status

```text
Application
        ✅

PostgreSQL
        ✅

Docker
        ✅

REST API
        ✅

Web UI
        ✅

Authentication
        ✅

Authorization / RBAC
        ✅

CRUD
        ✅

API → DB Validation Boundary
        ✅

Automation Framework
        🚧

UI Automation
        🚧

API Automation
        🚧

DB Automation
        🚧

Reporting
        🚧

CI/CD
        🚧
```

---

# 27. Future Evolution

The application itself should remain relatively stable while the automation framework evolves around it.

The intended progression is:

```text
Application Foundation
        │
        ▼
API Automation
        │
        ▼
Database Validation
        │
        ▼
UI Automation
        │
        ▼
API + UI + DB Integration
        │
        ▼
Framework Architecture
        │
        ▼
Reporting
        │
        ▼
Parallel Execution
        │
        ▼
Docker Execution
        │
        ▼
CI/CD
```

---

# 28. Architecture Objective

The primary architectural objective is to provide a **small but realistic application** that exposes enough complexity to practice Senior SDET engineering.

The application should remain:

```text
Small enough to understand
        +
Complex enough to automate
        +
Stable enough to test
        +
Realistic enough to discuss in interviews
```

The final outcome should demonstrate that a Senior SDET can build and maintain an automation solution across:

```text
UI
+
API
+
Database
+
Authentication
+
Authorization
+
Integration
+
CI/CD
```

---

## Summary

The SDET Practice Application acts as the **System Under Test**.

The future automation framework acts as the **quality engineering layer** around it.

```text
┌──────────────────────────────────────────┐
│          SDET AUTOMATION LAYER           │
│                                          │
│  Pytest | Playwright | HTTPX | psycopg  │
│                                          │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│             SYSTEM UNDER TEST            │
│                                          │
│      Web UI → FastAPI → PostgreSQL      │
│                                          │
│       JWT Authentication + RBAC          │
│                                          │
└──────────────────────────────────────────┘
```

**The application is the foundation. The automation framework is the real SDET project.**
