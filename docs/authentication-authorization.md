# SDET Practice Application — Authentication & Authorization

## 1. Overview

The SDET Practice Application uses authentication and authorization to protect application functionality.

The security model is:

```text
User
 │
 │ Email + Password
 ▼
Login
 │
 ▼
Credential Validation
 │
 ▼
JWT Access Token
 │
 ▼
Authenticated Request
 │
 ▼
Role Validation
 │
 ├── ADMIN
 │
 └── USER
```

The application separates two important concepts:

* **Authentication** — Who are you?
* **Authorization** — What are you allowed to do?

---

# 2. Authentication vs Authorization

## Authentication

Authentication verifies the identity of the user.

Example:

```text
Email:
admin@sdet.test

Password:
Admin@123
```

The application validates these credentials.

If valid:

```text
Credentials
    ↓
Authentication
    ↓
JWT Access Token
```

---

## Authorization

Authorization determines whether the authenticated user has permission to perform an operation.

Example:

```text
ADMIN
  ↓
Can delete users
```

but:

```text
USER
  ↓
Cannot delete users
```

Therefore:

```text
Authentication = Identity
Authorization  = Permission
```

---

# 3. Security Architecture

The expected security flow is:

```text
                   Client
                     │
                     ▼
                  Login
                     │
              Email + Password
                     │
                     ▼
             Authentication
                     │
              ┌──────┴──────┐
              │             │
            Valid         Invalid
              │             │
              ▼             ▼
          JWT Token        401
              │
              ▼
       Authenticated Request
              │
              ▼
       Authentication Check
              │
              ▼
        Current User
              │
              ▼
       Authorization Check
              │
        ┌─────┴─────┐
        │           │
      Allowed     Denied
        │           │
        ▼           ▼
      API          403
```

---

# 4. JWT Authentication

The application uses a JWT access token after successful login.

Conceptually:

```text
username/password
       ↓
     Login
       ↓
   JWT Token
       ↓
Authorization: Bearer <token>
```

The token is then sent with protected API requests.

Example:

```http
Authorization: Bearer <access_token>
```

---

# 5. Access Token

The access token represents the authenticated session.

Example structure:

```text
Authorization: Bearer eyJhbGciOi...
```

The actual token should never be hardcoded into automation tests.

Instead, the framework should:

```text
Login
  ↓
Extract Token
  ↓
Store Token
  ↓
Use Token
  ↓
Protected API Request
```

---

# 6. Bearer Authentication

Protected requests should use:

```http
Authorization: Bearer <access_token>
```

Example:

```http
GET /users
Authorization: Bearer eyJhbGciOi...
```

The API should validate the token before processing the request.

---

# 7. Authentication States

The application should distinguish between these states:

```text
Unauthenticated
      ↓
Authenticated
      ↓
Authorized / Unauthorized
```

For example:

### No Token

```text
GET /users
      ↓
401 Unauthorized
```

### Valid Token + USER

```text
DELETE /users/2
      ↓
403 Forbidden
```

### Valid Token + ADMIN

```text
DELETE /users/2
      ↓
204 No Content
```

---

# 8. HTTP 401 vs 403

This distinction is extremely important for both application behavior and SDET interviews.

## 401 Unauthorized

Use `401` when authentication is missing or invalid.

Examples:

```text
No token
Invalid token
Expired token
Invalid credentials
```

Flow:

```text
Request
  ↓
Authentication Failure
  ↓
401
```

---

## 403 Forbidden

Use `403` when the user is authenticated but does not have sufficient permissions.

Example:

```text
USER
 ↓
DELETE /users/2
 ↓
Authenticated
 ↓
Not ADMIN
 ↓
403
```

Flow:

```text
Request
  ↓
Authentication Successful
  ↓
Authorization Failure
  ↓
403
```

---

# 9. Role-Based Access Control

The application uses roles to control access.

Current roles:

```text
ADMIN
USER
```

The permission model is:

| Operation   | ADMIN | USER |
| ----------- | :---: | :--: |
| Login       |   ✅   |   ✅  |
| View Users  |   ✅   |   ✅  |
| View User   |   ✅   |   ✅  |
| Create User |   ✅   |   ❌  |
| Update User |   ✅   |   ❌  |
| Delete User |   ✅   |   ❌  |

---

# 10. ADMIN Role

ADMIN users have elevated permissions.

Expected permissions:

```text
ADMIN
 │
 ├── GET /users
 ├── GET /users/{id}
 ├── POST /users
 ├── PUT /users/{id}
 └── DELETE /users/{id}
```

---

# 11. USER Role

USER users have restricted permissions.

Expected permissions:

```text
USER
 │
 ├── GET /users
 ├── GET /users/{id}
 │
 ├── POST /users       ❌
 ├── PUT /users/{id}   ❌
 └── DELETE /users/{id} ❌
```

---

# 12. Authentication Flow

The complete login flow:

```text
1. User opens application
          ↓
2. Enters email
          ↓
3. Enters password
          ↓
4. Login request
          ↓
5. Server validates credentials
          ↓
6. JWT generated
          ↓
7. Token returned
          ↓
8. Client stores token
          ↓
9. Protected requests use token
```

---

# 13. Invalid Login Flow

Example:

```text
Email:
admin@sdet.test

Password:
WrongPassword
```

Expected:

```text
Login
  ↓
Credential Validation
  ↓
Failure
  ↓
401 Unauthorized
```

The application must not issue a valid access token.

---

# 14. Missing Token

Request:

```http
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

This is a fundamental authentication test.

---

# 15. Invalid Token

Example:

```http
GET /users
Authorization: Bearer invalid-token
```

Expected:

```text
401 Unauthorized
```

The application should reject the request.

---

# 16. USER Performing ADMIN Operation

Login as USER.

Then:

```http
DELETE /users/2
Authorization: Bearer <user_token>
```

Expected:

```text
403 Forbidden
```

This proves:

```text
Authentication = PASS
Authorization = FAIL
```

---

# 17. ADMIN Performing ADMIN Operation

Login as ADMIN.

Then:

```http
DELETE /users/2
Authorization: Bearer <admin_token>
```

Expected:

```text
204 No Content
```

This proves:

```text
Authentication = PASS
Authorization = PASS
```

---

# 18. Password Security

Passwords should never be stored as plaintext.

The database should contain:

```text
password_hash
```

rather than:

```text
password
```

Conceptually:

```text
User Password
      ↓
Password Hashing
      ↓
password_hash
      ↓
PostgreSQL
```

The original password should not be recoverable from the stored hash.

---

# 19. Password API Response Security

The API response must not expose the password or password hash.

Bad response:

```json
{
  "email": "user@test.com",
  "password": "Test@123"
}
```

Bad response:

```json
{
  "email": "user@test.com",
  "password_hash": "..."
}
```

Expected response should expose only appropriate user information.

Example:

```json
{
  "id": 2,
  "name": "Test User",
  "email": "user@test.com",
  "status": "ACTIVE"
}
```

---

# 20. Security Data Flow

The security architecture should look like:

```text
                 Password
                    │
                    ▼
              Hash Password
                    │
                    ▼
               PostgreSQL
                    │
                    │
Login ──────────────┘
  │
  ▼
Validate Password
  │
  ├── Invalid ──────► 401
  │
  ▼
Generate JWT
  │
  ▼
Access Token
  │
  ▼
Protected API
  │
  ▼
Authenticate
  │
  ▼
Get Current User
  │
  ▼
Check Role
  │
  ├── Unauthorized ──► 403
  │
  ▼
Execute Operation
```

---

# 21. Security Test Strategy

Security automation should cover:

```text
Authentication
Authorization
Token handling
Role validation
Password security
Access control
Protected endpoints
Negative scenarios
```

---

# 22. Authentication Test Cases

### AUTH-001 — Valid ADMIN Login

**Given**

Valid ADMIN credentials.

**When**

User logs in.

**Then**

Login succeeds.

Expected:

```text
200
```

Access token should be returned.

---

### AUTH-002 — Valid USER Login

Valid USER credentials should successfully authenticate.

Expected:

```text
200
```

---

### AUTH-003 — Invalid Password

Use a valid email with an incorrect password.

Expected:

```text
401
```

---

### AUTH-004 — Invalid User

Use an email that does not exist.

Expected:

```text
401
```

---

### AUTH-005 — Missing Authentication

Access a protected endpoint without a token.

Expected:

```text
401
```

---

### AUTH-006 — Invalid Token

Use an invalid JWT.

Expected:

```text
401
```

---

### AUTH-007 — Malformed Authorization Header

Example:

```http
Authorization: InvalidToken
```

Expected:

```text
401
```

---

# 23. Authorization Test Cases

### AUTHZ-001 — ADMIN Can Create

```text
ADMIN
  ↓
POST /users
  ↓
201
```

---

### AUTHZ-002 — ADMIN Can Update

```text
ADMIN
  ↓
PUT /users/{id}
  ↓
200
```

---

### AUTHZ-003 — ADMIN Can Delete

```text
ADMIN
  ↓
DELETE /users/{id}
  ↓
204
```

---

### AUTHZ-004 — USER Cannot Create

```text
USER
  ↓
POST /users
  ↓
403
```

---

### AUTHZ-005 — USER Cannot Update

```text
USER
  ↓
PUT /users/{id}
  ↓
403
```

---

### AUTHZ-006 — USER Cannot Delete

```text
USER
  ↓
DELETE /users/{id}
  ↓
403
```

---

# 24. Token Security Test Cases

The automation framework should verify:

```text
☐ Token is generated after valid login
☐ Token is rejected when invalid
☐ Token is rejected when malformed
☐ Protected endpoints require token
☐ USER token cannot perform ADMIN operations
☐ ADMIN token can perform ADMIN operations
```

---

# 25. Password Security Test Cases

The database should be checked to ensure:

```text
☐ Password is not stored in plaintext
☐ Password hash exists
☐ Password is not returned in API response
☐ Password hash is not returned in API response
```

---

# 26. Role Security Test Cases

Verify that role information is enforced consistently.

Example:

```text
Create User
     ↓
Role = USER
     ↓
Login
     ↓
Attempt DELETE
     ↓
403
```

ADMIN:

```text
Create/Login
     ↓
Role = ADMIN
     ↓
Attempt DELETE
     ↓
Operation Allowed
```

---

# 27. UI Authentication Scenarios

Authentication must also be tested through the browser.

### UI-AUTH-001

Open login page.

Expected:

```text
Login page displayed
```

### UI-AUTH-002

Enter valid credentials.

Expected:

```text
Dashboard displayed
```

### UI-AUTH-003

Enter invalid password.

Expected:

```text
Login failure message
```

### UI-AUTH-004

Logout.

Expected:

```text
User session terminated
```

---

# 28. UI Authorization Scenarios

### UI-AUTHZ-001

Login as ADMIN.

Expected:

```text
Create User
Edit User
Delete User
```

controls are available.

### UI-AUTHZ-002

Login as USER.

Expected:

```text
Create User
Edit User
Delete User
```

controls are unavailable or rejected according to the application's intended UI behavior.

---

# 29. API + UI Authentication Validation

A powerful E2E scenario:

```text
Browser
   ↓
Login
   ↓
JWT Token
   ↓
Dashboard
   ↓
Create User
   ↓
API
   ↓
PostgreSQL
```

The automation framework can validate all three layers:

```text
UI
+
API
+
Database
```

---

# 30. Authentication Test Data

Recommended test accounts:

| User              | Role  | Purpose                 |
| ----------------- | ----- | ----------------------- |
| `admin@sdet.test` | ADMIN | Admin scenarios         |
| `user@sdet.test`  | USER  | Normal user scenarios   |
| Invalid user      | —     | Negative authentication |

Do not hardcode passwords directly into the test source code.

Instead use configuration:

```text
.env
environment variables
secret management
CI/CD secrets
```

---

# 31. Automation Authentication Strategy

The framework should avoid logging in through the UI for every API test.

Instead:

```text
Authentication Manager
        │
        ▼
Login API
        │
        ▼
Access Token
        │
        ▼
Token Cache
        │
        ▼
API Tests
```

For UI tests:

```text
Browser
   ↓
Login UI
   ↓
Authenticated Session
   ↓
UI Tests
```

This keeps UI and API authentication strategies independent.

---

# 32. Recommended Framework Design

Our future automation framework should contain:

```text
framework/
│
├── api/
│   ├── client.py
│   └── auth_client.py
│
├── auth/
│   ├── token_manager.py
│   └── auth_manager.py
│
├── db/
│   └── db_client.py
│
├── ui/
│   ├── pages/
│   └── components/
│
├── config/
│   └── settings.py
│
└── utils/
```

---

# 33. Security Validation Pyramid

The test strategy should follow:

```text
                 E2E
                /   \
               /     \
             UI + API
             /       \
           API + DB
           /         \
        API Security
        /           \
    Authentication  Authorization
```

Most security scenarios should be tested at the API layer because it is faster and easier to diagnose.

---

# 34. Senior SDET Interview Topics Covered

This application allows us to demonstrate:

```text
JWT
OAuth-style bearer concepts
Authentication
Authorization
RBAC
401 vs 403
Password hashing
API security
Session/token handling
API automation
UI automation
Database validation
End-to-end testing
Negative testing
Test isolation
Test data management
```

---

# 35. Security Test Checklist

Before moving to automation:

```text
Authentication
☐ Valid ADMIN login
☐ Valid USER login
☐ Invalid credentials
☐ Missing credentials
☐ Invalid token
☐ Malformed token
☐ Missing Authorization header

Authorization
☐ ADMIN create
☐ ADMIN update
☐ ADMIN delete
☐ USER create blocked
☐ USER update blocked
☐ USER delete blocked

Password
☐ Password hashed
☐ Password not exposed
☐ Password hash not exposed

UI
☐ Login
☐ Logout
☐ Login failure
☐ ADMIN UI
☐ USER UI

Database
☐ Role persisted
☐ Password hash persisted
☐ User status persisted
```

---

# 36. Final Security Flow

The complete security model of the SDET Practice Application:

```text
                       USER
                         │
                         ▼
                  Email + Password
                         │
                         ▼
                       LOGIN
                         │
                ┌────────┴────────┐
                │                 │
             VALID             INVALID
                │                 │
                ▼                 ▼
             JWT Token           401
                │
                ▼
        Authorization Header
                │
                ▼
          Protected Endpoint
                │
                ▼
        Authenticate Token
                │
        ┌───────┴────────┐
        │                │
      Valid            Invalid
        │                │
        ▼                ▼
   Current User         401
        │
        ▼
     Check Role
        │
   ┌────┴────┐
   │         │
 ADMIN      USER
   │         │
   ▼         ▼
Allowed    Restricted
   │         │
   ▼         ▼
  2xx        403
```

---

# 37. Next Step

The application security documentation is now defined.

The next document should be:

```text
docs/database-guide.md
```

That document will cover:

```text
PostgreSQL
     ↓
Docker
     ↓
Database schema
     ↓
Tables
     ↓
Relationships
     ↓
SQL queries
     ↓
Test data
     ↓
DB validation
     ↓
API → DB testing
     ↓
UI → API → DB testing
```

After the documentation set is complete, we can move to the most important phase:

```text
SDET Practice Application
          ↓
Test Scenarios
          ↓
Automation Framework Design
          ↓
Pytest
          ↓
Playwright
          ↓
HTTPX
          ↓
PostgreSQL
          ↓
Allure
          ↓
CI/CD
```
