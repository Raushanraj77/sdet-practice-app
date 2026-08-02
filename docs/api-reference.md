# SDET Practice Application — API Reference

## 1. Overview

The SDET Practice Application exposes REST APIs through FastAPI.

Base URL:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

OpenAPI specification:

```text
http://127.0.0.1:8000/openapi.json
```

The API supports:

* Health checks
* Authentication
* User management
* JWT authentication
* Role-based authorization
* Request validation
* CRUD operations
* Error handling

---

# 2. API Architecture

```text
Client
  │
  ▼
HTTP Request
  │
  ▼
FastAPI
  │
  ├── Authentication
  │
  ├── Authorization
  │
  ├── Request Validation
  │
  ▼
Route Handler
  │
  ▼
SQLAlchemy
  │
  ▼
PostgreSQL
```

---

# 3. Common HTTP Headers

For authenticated endpoints:

```http
Authorization: Bearer <access_token>
```

For JSON requests:

```http
Content-Type: application/json
```

Example:

```http
Authorization: Bearer eyJ...
Content-Type: application/json
```

---

# 4. HTTP Status Codes

The application uses standard HTTP status codes.

| Status | Meaning                         |
| -----: | ------------------------------- |
|  `200` | Request successful              |
|  `201` | Resource created                |
|  `204` | Resource successfully deleted   |
|  `400` | Bad request                     |
|  `401` | Authentication required/invalid |
|  `403` | Authenticated but unauthorized  |
|  `404` | Resource not found              |
|  `409` | Resource conflict               |
|  `422` | Request validation failure      |
|  `500` | Internal server error           |

---

# 5. Health Check

## GET `/health`

Checks whether the application is running.

### Authentication

Not required.

### Request

```http
GET /health
```

### Expected Response

```json
{
  "status": "UP",
  "service": "sdet-practice-app"
}
```

### Expected Status

```text
200 OK
```

### Automation Importance

This should become the first smoke test.

```text
Application Started
       ↓
GET /health
       ↓
200
       ↓
Application Available
```

---

# 6. Authentication API

Authentication endpoints should be documented according to the current implementation exposed by the application.

Use Swagger to verify the exact authentication endpoint:

```text
http://127.0.0.1:8000/docs
```

The expected authentication flow is:

```text
Credentials
    ↓
Login API
    ↓
Credential Validation
    ↓
JWT Access Token
    ↓
Authenticated API Requests
```

The returned access token is used as:

```http
Authorization: Bearer <access_token>
```

---

# 7. Authentication Test Matrix

| Scenario            |                                       Expected |
| ------------------- | ---------------------------------------------: |
| Valid credentials   |                                          `200` |
| Invalid password    |                                          `401` |
| Invalid user        |                                          `401` |
| Missing credentials | `401` / validation error depending on endpoint |
| Invalid token       |                                          `401` |
| Expired token       |                                          `401` |
| Valid token         |                                Request allowed |

---

# 8. User API

Base path:

```text
/users
```

Available operations:

```text
POST   /users
GET    /users
GET    /users/{user_id}
PUT    /users/{user_id}
DELETE /users/{user_id}
```

---

# 9. Create User

## POST `/users`

Creates a new user.

### Authorization

ADMIN role required.

### Request

```http
POST /users
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Example payload:

```json
{
  "name": "Automation Test User",
  "email": "automation@test.com",
  "password": "Test@123"
}
```

### Expected Success

```text
201 Created
```

Example response:

```json
{
  "id": 2,
  "name": "Automation Test User",
  "email": "automation@test.com",
  "status": "ACTIVE",
  "created_at": "2026-08-02T10:30:00",
  "updated_at": "2026-08-02T10:30:00"
}
```

The exact timestamp and generated ID will vary.

### Database Impact

A new row should be inserted into:

```text
users
```

Validate using:

```sql
SELECT
    id,
    name,
    email,
    status,
    created_at,
    updated_at
FROM users
WHERE email = 'automation@test.com';
```

---

# 10. Create User — Unauthorized

Attempt to create a user without authentication.

```http
POST /users
```

Expected:

```text
401 Unauthorized
```

---

# 11. Create User — Forbidden

Authenticate as a normal USER and attempt:

```http
POST /users
```

Expected:

```text
403 Forbidden
```

This verifies RBAC.

---

# 12. Create User — Duplicate Email

Attempt to create a user using an existing email.

Example:

```json
{
  "name": "Duplicate User",
  "email": "automation@test.com",
  "password": "Test@123"
}
```

Expected:

```text
409 Conflict
```

The database should not contain a duplicate user.

---

# 13. Create User — Invalid Payload

Example:

```json
{
  "name": "",
  "email": "invalid-email",
  "password": ""
}
```

Expected:

```text
422 Unprocessable Entity
```

The exact validation behavior should follow the currently implemented Pydantic schema.

---

# 14. Get All Users

## GET `/users`

Returns users.

### Authorization

Authenticated user required.

### Request

```http
GET /users
Authorization: Bearer <access_token>
```

### Expected

```text
200 OK
```

Example:

```json
[
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@sdet.test",
    "status": "ACTIVE",
    "created_at": "2026-08-02T10:00:00",
    "updated_at": "2026-08-02T10:00:00"
  }
]
```

---

# 15. Get Users — Missing Token

```http
GET /users
```

without an Authorization header.

Expected:

```text
401 Unauthorized
```

This is an important authentication test.

---

# 16. Get Users — Invalid Token

Example:

```http
GET /users
Authorization: Bearer invalid-token
```

Expected:

```text
401 Unauthorized
```

---

# 17. Get User by ID

## GET `/users/{user_id}`

Retrieves a specific user.

Example:

```http
GET /users/1
```

Expected:

```text
200 OK
```

Example response:

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@sdet.test",
  "status": "ACTIVE",
  "created_at": "2026-08-02T10:00:00",
  "updated_at": "2026-08-02T10:00:00"
}
```

---

# 18. Get User — Nonexistent ID

Example:

```http
GET /users/99999
```

Expected:

```text
404 Not Found
```

Example:

```json
{
  "detail": "User not found"
}
```

---

# 19. Get User — Invalid ID

Example:

```http
GET /users/abc
```

FastAPI should reject the invalid path parameter.

Expected:

```text
422 Unprocessable Entity
```

---

# 20. Update User

## PUT `/users/{user_id}`

Updates an existing user.

### Authorization

ADMIN role required.

### Request

```http
PUT /users/2
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Example:

```json
{
  "name": "Updated Automation User",
  "email": "updated@test.com",
  "password": "Updated@123"
}
```

### Expected

```text
200 OK
```

### Database Impact

The corresponding user record should be updated.

Validate:

```sql
SELECT
    id,
    name,
    email,
    updated_at
FROM users
WHERE id = 2;
```

---

# 21. Update User — Nonexistent ID

Example:

```http
PUT /users/99999
```

Expected:

```text
404 Not Found
```

---

# 22. Update User — Duplicate Email

Attempt to update a user with another user's email.

Example:

```json
{
  "name": "Updated User",
  "email": "existing@test.com",
  "password": "Test@123"
}
```

Expected:

```text
409 Conflict
```

Example response:

```json
{
  "detail": "Email already belongs to another user"
}
```

---

# 23. Update User — USER Role

Authenticate as a normal USER and attempt to update a user.

Expected:

```text
403 Forbidden
```

---

# 24. Delete User

## DELETE `/users/{user_id}`

Deletes an existing user.

### Authorization

ADMIN role required.

### Request

```http
DELETE /users/2
Authorization: Bearer <admin_access_token>
```

### Expected

```text
204 No Content
```

The response body should be empty.

---

# 25. Delete User — Nonexistent ID

Example:

```http
DELETE /users/99999
Authorization: Bearer <admin_access_token>
```

Expected:

```text
404 Not Found
```

---

# 26. Delete User — USER Role

Authenticate as a normal USER.

Attempt:

```http
DELETE /users/2
Authorization: Bearer <user_access_token>
```

Expected:

```text
403 Forbidden
```

---

# 27. CRUD Lifecycle

A complete user lifecycle looks like:

```text
POST /users
     │
     ▼
201 Created
     │
     ▼
GET /users/{id}
     │
     ▼
200 OK
     │
     ▼
PUT /users/{id}
     │
     ▼
200 OK
     │
     ▼
DELETE /users/{id}
     │
     ▼
204 No Content
     │
     ▼
GET /users/{id}
     │
     ▼
404 Not Found
```

This lifecycle will later become an end-to-end API test.

---

# 28. API → Database Validation

For every data-changing API, the automation framework should validate both:

```text
API Response
     +
Database State
```

Example:

```text
POST /users
     │
     ├──────────────► API Response
     │                    │
     │                    ▼
     │                 201
     │
     └──────────────► PostgreSQL
                          │
                          ▼
                    SELECT user
                          │
                          ▼
                    Validate data
```

---

# 29. API Response vs Database Validation

Example API response:

```json
{
  "id": 10,
  "name": "API DB User",
  "email": "apidb@test.com",
  "status": "ACTIVE"
}
```

Database:

```sql
SELECT
    id,
    name,
    email,
    status
FROM users
WHERE email = 'apidb@test.com';
```

The automation framework should compare:

| Field  | API              | DB               |
| ------ | ---------------- | ---------------- |
| ID     | `10`             | `10`             |
| Name   | `API DB User`    | `API DB User`    |
| Email  | `apidb@test.com` | `apidb@test.com` |
| Status | `ACTIVE`         | `ACTIVE`         |

---

# 30. Database Security Validation

Password values should not be stored in plaintext.

Validate:

```sql
SELECT
    email,
    password_hash
FROM users;
```

The database should contain a hash.

The original password must not be returned in the API response.

This gives us two useful assertions:

```text
API
└── Password is NOT exposed

DB
└── Password is hashed
```

---

# 31. API Test Categories

The API automation suite should eventually be divided into:

```text
tests/
│
├── smoke/
│
├── authentication/
│
├── authorization/
│
├── users/
│
├── negative/
│
└── integration/
```

---

# 32. Smoke Tests

Minimum smoke suite:

```text
1. Health endpoint
2. Valid login
3. Get users
4. Create user
```

The goal is to quickly determine whether the environment is usable.

---

# 33. Authentication Tests

Examples:

```text
AUTH-001 Valid login
AUTH-002 Invalid password
AUTH-003 Invalid user
AUTH-004 Missing credentials
AUTH-005 Invalid JWT
AUTH-006 Expired JWT
```

---

# 34. Authorization Tests

Examples:

```text
AUTHZ-001 ADMIN can create user
AUTHZ-002 ADMIN can update user
AUTHZ-003 ADMIN can delete user
AUTHZ-004 USER cannot create user
AUTHZ-005 USER cannot update user
AUTHZ-006 USER cannot delete user
```

---

# 35. CRUD Tests

Examples:

```text
USER-001 Create user
USER-002 Get all users
USER-003 Get user by ID
USER-004 Update user
USER-005 Delete user
```

---

# 36. Negative Tests

Examples:

```text
NEG-001 Invalid user ID
NEG-002 Nonexistent user
NEG-003 Duplicate email
NEG-004 Invalid email
NEG-005 Missing required field
NEG-006 Invalid token
NEG-007 Missing token
NEG-008 Unauthorized role
```

---

# 37. API + Database Integration Tests

Examples:

```text
DB-001 Create API user and verify DB
DB-002 Update API user and verify DB
DB-003 Delete API user and verify DB
DB-004 Verify password hashing
DB-005 Verify role persistence
DB-006 Verify status persistence
DB-007 Verify created_at
DB-008 Verify updated_at
```

---

# 38. Recommended Senior SDET Assertions

API tests should not stop at:

```python
assert response.status_code == 200
```

A Senior SDET-level test should validate:

```text
HTTP Status
+
Response Schema
+
Required Fields
+
Business Rules
+
Headers
+
Response Data
+
Database State
+
Side Effects
```

For example:

```text
POST /users
    ↓
Status = 201
    ↓
Response schema valid
    ↓
ID generated
    ↓
Email matches request
    ↓
Status = ACTIVE
    ↓
Password not exposed
    ↓
DB record exists
    ↓
Password stored hashed
```

---

# 39. Test Data Strategy

Test data should be unique and predictable.

Avoid hardcoding:

```text
test@test.com
```

for every test.

Prefer generated data such as:

```text
sdet_<timestamp>@test.com
```

or a dedicated test-data factory.

Example:

```text
Name:
API Test User 123

Email:
api_test_123@test.com
```

The future framework should provide reusable test-data generation.

---

# 40. API Test Independence

Tests should avoid unnecessary dependencies.

Bad:

```text
Test 2 depends on Test 1
Test 3 depends on Test 2
Test 4 depends on Test 3
```

Prefer:

```text
Test 1 → Independent
Test 2 → Independent
Test 3 → Independent
Test 4 → Independent
```

Each test should create and clean up its own data when appropriate.

---

# 41. Cleanup Strategy

Data created during tests should be cleaned up.

Example:

```text
Create Test User
      ↓
Run Assertions
      ↓
Validate DB
      ↓
Delete Test User
      ↓
Verify Cleanup
```

This prevents test data from contaminating future runs.

---

# 42. API Automation Target

The final API automation architecture should look like:

```text
                 Pytest
                    │
                    ▼
              Test Scenarios
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    API Client   Auth Manager  DB Client
        │           │           │
        ▼           ▼           ▼
      HTTPX        JWT       psycopg
        │                       │
        └───────────┬───────────┘
                    ▼
              PostgreSQL
```

---

# 43. API Automation Principles

The framework should follow:

```text
Reusable API Client
Reusable DB Client
Reusable Authentication
Central Configuration
Environment Support
Schema Validation
Strong Assertions
Test Data Management
Cleanup
Logging
Reporting
Parallel Execution
CI/CD
```

---

# 44. API Documentation Checklist

Before automation begins, verify:

```text
☐ Base URL documented
☐ Health endpoint documented
☐ Authentication endpoint documented
☐ JWT usage documented
☐ User endpoints documented
☐ Request schemas documented
☐ Response schemas documented
☐ Status codes documented
☐ Authentication failures documented
☐ Authorization failures documented
☐ Negative cases documented
☐ Database impact documented
☐ API → DB validation documented
```

---

# 45. Next Step

After the API reference is complete, the next documentation should be:

```text
docs/authentication-authorization.md
```

That document will go deeper into:

```text
Authentication
      ↓
JWT
      ↓
Access Token
      ↓
Bearer Authentication
      ↓
Current User
      ↓
Roles
      ↓
Permissions
      ↓
401 vs 403
      ↓
Security Test Scenarios
```

This document will become especially important when we later design the **Senior SDET API security and authorization test suite**.
