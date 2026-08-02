# SDET Practice Application — Application Guide

## 1. Purpose

This guide explains how to use the **SDET Practice Application** after the application has been started successfully.

The application is designed around a simple user-management system with:

* Login
* JWT authentication
* Role-based authorization
* User management
* REST API integration
* PostgreSQL persistence

The goal is to understand the application's behavior before beginning automation.

---

# 2. Start the Application

From the project root:

```bash
docker compose up -d
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

---

# 3. Application URLs

| Resource        | URL                                  | Purpose            |
| --------------- | ------------------------------------ | ------------------ |
| Web Application | `http://127.0.0.1:8000/`             | Main UI            |
| Swagger         | `http://127.0.0.1:8000/docs`         | API testing        |
| OpenAPI         | `http://127.0.0.1:8000/openapi.json` | API contract       |
| Health          | `http://127.0.0.1:8000/health`       | Application health |

---

# 4. Health Check

Before testing the application, verify that it is running.

Open:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "sdet-practice-app"
}
```

Expected HTTP status:

```text
200 OK
```

This endpoint can later be used as the first **smoke test** in the automation framework.

---

# 5. Open the Web Application

Open:

```text
http://127.0.0.1:8000/
```

The application provides the UI for interacting with the user-management functionality.

The general workflow is:

```text
Open Application
       ↓
Login
       ↓
JWT Authentication
       ↓
Authorization
       ↓
Dashboard
       ↓
User Management
```

---

# 6. Authentication

The application requires authentication for protected functionality.

The authentication flow is:

```text
Email + Password
       ↓
Login API
       ↓
Credential Validation
       ↓
JWT Access Token
       ↓
Authenticated Session
```

The access token is used for subsequent protected requests.

Conceptually:

```http
Authorization: Bearer <access_token>
```

---

# 7. Login as ADMIN

Use the configured ADMIN credentials.

Example:

```text
Email:
admin@sdet.test

Password:
Admin@123
```

> Use the actual credentials configured in your local database if they differ from the examples above.

After successful login:

```text
Login
  ↓
JWT Token
  ↓
Authenticated User
  ↓
ADMIN Permissions
```

The ADMIN should have access to user-management operations.

---

# 8. Login as USER

Use the configured USER credentials.

Example:

```text
Email:
user@sdet.test

Password:
User@123
```

After successful login:

```text
Login
  ↓
JWT Token
  ↓
Authenticated User
  ↓
USER Permissions
```

A USER has more restricted permissions than an ADMIN.

---

# 9. ADMIN vs USER

The application uses Role-Based Access Control.

## ADMIN

The ADMIN can:

```text
✅ Login
✅ View users
✅ View user details
✅ Create users
✅ Update users
✅ Delete users
```

## USER

The USER can:

```text
✅ Login
✅ View users
✅ View user details

❌ Create users
❌ Update users
❌ Delete users
```

---

# 10. Permission Matrix

| Action      | ADMIN | USER |
| ----------- | :---: | :--: |
| Login       |   ✅   |   ✅  |
| View Users  |   ✅   |   ✅  |
| View User   |   ✅   |   ✅  |
| Create User |   ✅   |   ❌  |
| Update User |   ✅   |   ❌  |
| Delete User |   ✅   |   ❌  |
| Logout      |   ✅   |   ✅  |

This matrix will later become the foundation for authorization tests.

---

# 11. User Management

The application supports basic CRUD operations.

```text
Create
Read
Update
Delete
```

The workflow is:

```text
User Management
       │
       ├── Create User
       │
       ├── View Users
       │
       ├── View User
       │
       ├── Update User
       │
       └── Delete User
```

---

# 12. Create User

Only an ADMIN can create a new user.

Example data:

```text
Name:
Automation Test User

Email:
automation@test.com

Password:
Test@123
```

The request is sent to:

```text
POST /users
```

Expected result:

```text
201 Created
```

After creation, the new user should exist in PostgreSQL.

---

# 13. Verify Created User in Database

Connect to PostgreSQL:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Run:

```sql
SELECT
    id,
    name,
    email,
    role,
    status
FROM users
ORDER BY id;
```

Locate:

```text
automation@test.com
```

The database record should correspond to the user created through the application.

This is an important future automation scenario:

```text
UI/API
   ↓
Create User
   ↓
201 Created
   ↓
Database Query
   ↓
Validate User
```

---

# 14. View Users

Authenticated users can retrieve users.

API:

```text
GET /users
```

Expected response:

```text
200 OK
```

The UI should display the available users according to the application's current behavior.

---

# 15. View Individual User

A specific user can be retrieved using their ID.

Example:

```text
GET /users/1
```

Expected:

```text
200 OK
```

If the user does not exist:

```text
GET /users/99999
```

Expected:

```text
404 Not Found
```

This is an important negative test.

---

# 16. Update User

ADMIN users can update user information.

Example:

```text
Name:
Updated Automation User

Email:
updated@test.com
```

API:

```text
PUT /users/{user_id}
```

Expected:

```text
200 OK
```

After the update, verify the database:

```sql
SELECT
    id,
    name,
    email,
    updated_at
FROM users
WHERE id = 1;
```

The updated values should be persisted.

---

# 17. Delete User

ADMIN users can delete users.

API:

```text
DELETE /users/{user_id}
```

Expected:

```text
204 No Content
```

After deletion:

```text
GET /users/{user_id}
```

should return:

```text
404 Not Found
```

Database validation:

```sql
SELECT *
FROM users
WHERE id = 1;
```

The deleted user should no longer exist.

---

# 18. Duplicate Email

The application prevents duplicate email addresses.

Example:

Create:

```text
automation@test.com
```

again.

Expected:

```text
409 Conflict
```

This is an important API negative scenario.

Expected behavior:

```text
Existing Email
      ↓
Create User
      ↓
Conflict
      ↓
409
```

---

# 19. USER Attempting ADMIN Operation

Login as USER.

Attempt:

```text
POST /users
```

or:

```text
PUT /users/{id}
```

or:

```text
DELETE /users/{id}
```

Expected:

```text
403 Forbidden
```

The distinction is important:

```text
No / invalid authentication
        ↓
401 Unauthorized
```

versus:

```text
Valid authentication
        +
Insufficient permission
        ↓
403 Forbidden
```

---

# 20. Invalid Login

Try an incorrect password.

Example:

```text
Email:
admin@sdet.test

Password:
WrongPassword
```

Expected:

```text
401 Unauthorized
```

The user should not be authenticated.

---

# 21. Missing Authentication

Attempt to access a protected endpoint without a token.

Example:

```text
GET /users
```

without:

```http
Authorization: Bearer <token>
```

Expected:

```text
401 Unauthorized
```

This is a key authentication test.

---

# 22. Invalid Token

Send a fake or malformed token.

Example:

```http
Authorization: Bearer invalid-token
```

Expected:

```text
401 Unauthorized
```

The API must reject the request.

---

# 23. API Testing Through Swagger

Open:

```text
http://127.0.0.1:8000/docs
```

Swagger provides an interactive interface for API testing.

Recommended manual flow:

```text
1. Login
      ↓
2. Obtain access token
      ↓
3. Authorize
      ↓
4. GET /users
      ↓
5. POST /users
      ↓
6. GET /users/{id}
      ↓
7. PUT /users/{id}
      ↓
8. DELETE /users/{id}
```

Swagger should be used initially to understand API behavior before automating it.

---

# 24. Database Validation

Database access:

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
SELECT * FROM users;
```

More targeted validation:

```sql
SELECT
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at
FROM users
ORDER BY id;
```

---

# 25. Password Validation

Passwords must not be stored as plain text.

Check:

```sql
SELECT
    email,
    password_hash
FROM users;
```

The value should be a password hash rather than the original password.

Conceptually:

```text
Plain Password
      ↓
Password Hashing
      ↓
password_hash
      ↓
PostgreSQL
```

This provides a useful database security validation scenario.

---

# 26. Complete ADMIN Workflow

A complete manual ADMIN workflow:

```text
1. Open Application
        ↓
2. Login as ADMIN
        ↓
3. Verify Dashboard
        ↓
4. View Users
        ↓
5. Create User
        ↓
6. Verify User
        ↓
7. Update User
        ↓
8. Verify Updated User
        ↓
9. Delete User
        ↓
10. Verify User Removed
        ↓
11. Logout
```

---

# 27. Complete USER Workflow

A USER workflow:

```text
1. Open Application
        ↓
2. Login as USER
        ↓
3. Verify Dashboard
        ↓
4. View Users
        ↓
5. Attempt Admin Operation
        ↓
6. Verify 403 Forbidden
        ↓
7. Logout
```

---

# 28. Complete API → Database Workflow

This workflow is particularly important for Senior SDET preparation.

```text
              API
               │
               ▼
         Create User
               │
               ▼
          201 Created
               │
               ▼
           PostgreSQL
               │
               ▼
         Query User
               │
               ▼
      Compare API ↔ DB
               │
               ▼
          PASS / FAIL
```

Example:

```text
POST /users
```

Request:

```json
{
  "name": "DB Test User",
  "email": "dbtest@test.com",
  "password": "Test@123"
}
```

Then:

```sql
SELECT
    name,
    email,
    role,
    status
FROM users
WHERE email = 'dbtest@test.com';
```

---

# 29. Complete UI → API → Database Workflow

This is the most important end-to-end scenario.

```text
                Browser
                   │
                   ▼
                 Login
                   │
                   ▼
              JWT Token
                   │
                   ▼
             User Action
                   │
                   ▼
              REST API
                   │
                   ▼
             PostgreSQL
                   │
                   ▼
            Database State
```

Example:

```text
ADMIN Login
     ↓
Create User through UI
     ↓
POST /users
     ↓
201 Created
     ↓
Verify User in UI
     ↓
Query PostgreSQL
     ↓
Validate Database Record
```

This workflow will later be automated with:

```text
Playwright
+
HTTPX
+
psycopg
+
Pytest
```

---

# 30. Recommended Manual Smoke Test

Before starting automation, execute this small smoke test.

### Step 1

Verify:

```text
GET /health
```

Expected:

```text
200
```

### Step 2

Login with valid ADMIN credentials.

Expected:

```text
Successful authentication
```

### Step 3

Get users.

Expected:

```text
200
```

### Step 4

Create a user.

Expected:

```text
201
```

### Step 5

Verify the user in PostgreSQL.

Expected:

```text
Record exists
```

### Step 6

Update the user.

Expected:

```text
200
```

### Step 7

Verify database update.

Expected:

```text
Updated record exists
```

### Step 8

Delete the user.

Expected:

```text
204
```

### Step 9

Verify user no longer exists.

Expected:

```text
404
```

### Step 10

Logout.

Expected:

```text
Session/token removed
```

---

# 31. Manual Testing Checklist

Before moving to automation:

```text
Authentication
☐ Valid ADMIN login
☐ Valid USER login
☐ Invalid password
☐ Invalid email
☐ Missing authentication
☐ Invalid token

Authorization
☐ ADMIN can create
☐ ADMIN can update
☐ ADMIN can delete
☐ USER cannot create
☐ USER cannot update
☐ USER cannot delete

CRUD
☐ Create user
☐ Read users
☐ Read individual user
☐ Update user
☐ Delete user

Validation
☐ Duplicate email
☐ Invalid user ID
☐ Invalid request payload

Database
☐ Created record
☐ Updated record
☐ Deleted record
☐ Password hash
☐ Role
☐ Status
☐ Timestamps

UI
☐ Login
☐ Dashboard
☐ User listing
☐ User creation
☐ User update
☐ User deletion
☐ Logout
```

---

# 32. What We Should Know Before Automation

Before writing the first automated test, an SDET should understand:

```text
Application
    ↓
User workflows
    ↓
API endpoints
    ↓
Authentication
    ↓
Authorization
    ↓
Database schema
    ↓
Expected status codes
    ↓
Positive scenarios
    ↓
Negative scenarios
    ↓
End-to-end workflows
```

Only after understanding these should we begin designing the automation framework.

---

# 33. Next Step

Once the application has been manually validated, the next documentation areas are:

```text
Application Guide
      ↓
API Reference
      ↓
Authentication & Authorization
      ↓
Database Documentation
      ↓
UI Guide
      ↓
Test Scenarios
      ↓
Automation Framework
```

The **SDET Practice Application is the System Under Test**.

The automation framework we build next will become the **Senior SDET engineering project around this application**.
