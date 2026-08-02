# SDET Practice Application — Test Scenarios

## 1. Purpose

This document defines the test scenarios for the SDET Practice Application.

The goal is not to create hundreds of tests.

Instead, we will build a **small but realistic test suite** that demonstrates Senior SDET capabilities across:

* UI automation
* API automation
* Database validation
* Authentication
* Authorization
* Negative testing
* End-to-end testing
* Data validation
* Security validation
* Integration testing

The target is approximately **30 high-value automated tests**.

---

# 2. Application Under Test

The application consists of:

```text
                SDET Practice Application
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
            UI           API           DB
             │            │            │
        HTML/CSS/JS     FastAPI     PostgreSQL
             │            │            │
             └────────────┼────────────┘
                          │
                       Docker
```

---

# 3. Test Strategy

We will use a layered test strategy.

```text
                         E2E
                          ▲
                          │
                    UI + API + DB
                          │
              ┌───────────┴───────────┐
              │                       │
             UI                      API
              │                       │
              └───────────┬───────────┘
                          │
                         DB
```

The majority of functional validation should be performed at the API layer.

UI tests should focus on critical user journeys.

Database tests should validate persistence and data integrity.

A smaller number of tests should validate complete:

```text
UI → API → DB
```

flows.

---

# 4. Test Suite Distribution

Target:

| Area              | Target |
| ----------------- | -----: |
| UI                |      8 |
| API               |      8 |
| Database          |      4 |
| Authentication    |      4 |
| Authorization     |      3 |
| E2E / Integration |      3 |
| **Total**         | **30** |

Some scenarios may overlap multiple categories.

For example:

```text
E2E-001
UI → API → DB
```

is simultaneously a UI, API, database, and integration test.

---

# 5. Test Priority

We will use:

```text
P0 = Critical
P1 = High
P2 = Medium
P3 = Low
```

### P0

Application cannot be considered usable if this fails.

Examples:

```text
Login
Create user
Authentication
Authorization
Critical API availability
```

### P1

Important business functionality.

Examples:

```text
Update user
Delete user
User retrieval
Database persistence
```

### P2

Useful negative and validation scenarios.

Examples:

```text
Invalid email
Duplicate email
Invalid ID
```

### P3

Optional enhancements.

Examples:

```text
Visual details
Minor UI validation
Browser-specific cosmetic behavior
```

---

# 6. UI Test Scenarios

## UI-001 — Valid ADMIN Login

**Priority:** P0

### Preconditions

ADMIN account exists.

### Steps

```text
1. Open application
2. Enter ADMIN email
3. Enter ADMIN password
4. Click Login
```

### Expected

```text
Login succeeds
Dashboard is displayed
Authenticated state is established
```

---

## UI-002 — Valid USER Login

**Priority:** P0

### Steps

```text
1. Open application
2. Enter USER credentials
3. Click Login
```

### Expected

```text
Login succeeds
Dashboard is displayed
```

---

## UI-003 — Invalid Login

**Priority:** P1

### Steps

```text
1. Open login page
2. Enter invalid credentials
3. Click Login
```

### Expected

```text
Login fails
401 response is handled
Error message is displayed
User remains unauthenticated
```

---

## UI-004 — Display Users

**Priority:** P1

### Preconditions

Authenticated user exists.

### Steps

```text
1. Login
2. Open Users page
```

### Expected

```text
Users page is displayed
User records are visible
```

---

## UI-005 — Create User

**Priority:** P0

### Steps

```text
1. Login as ADMIN
2. Open Users
3. Click Create User
4. Enter valid details
5. Submit
```

### Expected

```text
User is created
Success message appears
New user appears in user list
```

---

## UI-006 — Duplicate Email

**Priority:** P1

### Steps

```text
1. Login as ADMIN
2. Create a user using an existing email
```

### Expected

```text
User is not created
Error is displayed
Existing record remains unchanged
```

---

## UI-007 — Update User

**Priority:** P1

### Steps

```text
1. Login as ADMIN
2. Open Users
3. Select a user
4. Edit user
5. Save
```

### Expected

```text
User information is updated
Updated information appears in UI
```

---

## UI-008 — Delete User

**Priority:** P1

### Steps

```text
1. Login as ADMIN
2. Open Users
3. Select user
4. Click Delete
5. Confirm
```

### Expected

```text
User is deleted
User disappears from UI
Success feedback appears
```

---

# 7. API Test Scenarios

## API-001 — Create User

**Priority:** P0

```http
POST /users
```

### Expected

```text
HTTP 201
Valid response schema
User ID returned
User data returned
```

---

## API-002 — Get User

**Priority:** P1

```http
GET /users/{id}
```

### Expected

```text
HTTP 200
Correct user returned
```

---

## API-003 — Get Users

**Priority:** P1

```http
GET /users
```

### Expected

```text
HTTP 200
Response is an array
Schema is valid
```

---

## API-004 — Update User

**Priority:** P1

```http
PUT /users/{id}
```

### Expected

```text
HTTP 200
Updated values returned
```

---

## API-005 — Delete User

**Priority:** P1

```http
DELETE /users/{id}
```

### Expected

```text
HTTP 204
User is removed
```

---

## API-006 — Get Non-existent User

**Priority:** P1

```http
GET /users/999999
```

### Expected

```text
HTTP 404
Correct error response
```

---

## API-007 — Duplicate Email

**Priority:** P1

```http
POST /users
```

with an existing email.

### Expected

```text
HTTP 409
Correct error message
```

---

## API-008 — Invalid User Payload

**Priority:** P2

Send invalid data.

Examples:

```text
Invalid email
Missing required field
Invalid data type
```

### Expected

```text
HTTP 400/422
Validation error returned
```

The exact expected status should follow the application's implemented contract.

---

# 8. Authentication Test Scenarios

## AUTH-001 — Valid Login

**Priority:** P0

```text
Valid credentials
      ↓
Authentication
      ↓
Access token
```

Expected:

```text
Successful authentication
Access token returned
```

---

## AUTH-002 — Invalid Password

**Priority:** P0

```text
Valid email
+
Wrong password
```

Expected:

```text
401 Unauthorized
```

---

## AUTH-003 — Missing Authentication

**Priority:** P0

Call protected endpoint without token.

Example:

```http
GET /users
```

Expected:

```text
401 Unauthorized
```

---

## AUTH-004 — Invalid Token

**Priority:** P1

Send an invalid or malformed token.

Expected:

```text
401 Unauthorized
```

---

# 9. Authorization Test Scenarios

## AUTHZ-001 — ADMIN Can Create User

**Priority:** P0

```text
ADMIN
  ↓
POST /users
  ↓
201
```

Expected:

```text
Operation permitted
```

---

## AUTHZ-002 — USER Cannot Create User

**Priority:** P0

```text
USER
  ↓
POST /users
```

Expected:

```text
403 Forbidden
```

---

## AUTHZ-003 — USER Cannot Delete User

**Priority:** P0

```text
USER
  ↓
DELETE /users/{id}
```

Expected:

```text
403 Forbidden
```

---

# 10. Database Test Scenarios

## DB-001 — Created User Persists

**Priority:** P0

After:

```text
POST /users
```

query:

```sql
SELECT *
FROM users
WHERE email = '<email>';
```

Expected:

```text
Exactly one record exists
```

---

## DB-002 — Updated User Persists

After:

```text
PUT /users/{id}
```

query database.

Expected:

```text
Updated name matches
Updated email matches
updated_at is maintained
```

---

## DB-003 — Deleted User Does Not Exist

After:

```text
DELETE /users/{id}
```

query:

```sql
SELECT *
FROM users
WHERE id = <id>;
```

Expected:

```text
0 rows
```

---

## DB-004 — Password Is Not Stored Plaintext

Query:

```sql
SELECT password_hash
FROM users
WHERE email = '<email>';
```

Expected:

```text
password_hash exists
password_hash != plaintext password
```

The exact hashing algorithm should be validated against the application's implementation rather than hardcoded into the test unless algorithm verification is explicitly part of the requirement.

---

# 11. End-to-End Test Scenarios

These are our most valuable integrated tests.

---

## E2E-001 — Create User Through UI and Validate DB

**Priority:** P0

Flow:

```text
Login
  ↓
Users
  ↓
Create User
  ↓
POST /users
  ↓
201
  ↓
User appears in UI
  ↓
Query PostgreSQL
  ↓
Validate record
```

Assertions:

```text
UI user exists
API request succeeds
DB record exists
Data matches
```

---

## E2E-002 — Update User Through UI and Validate DB

**Priority:** P1

Flow:

```text
Login
  ↓
Users
  ↓
Edit User
  ↓
PUT /users/{id}
  ↓
200
  ↓
UI displays updated data
  ↓
Database validation
```

Assertions:

```text
UI data matches
API response matches
DB data matches
```

---

## E2E-003 — Delete User Through UI and Validate DB

**Priority:** P1

Flow:

```text
Login
  ↓
Users
  ↓
Delete
  ↓
Confirmation
  ↓
DELETE /users/{id}
  ↓
204
  ↓
User disappears from UI
  ↓
Database query
  ↓
0 rows
```

---

# 12. API Contract Validation

API tests should validate more than status codes.

For successful user creation:

```text
HTTP status
Headers
Response structure
Data types
Required fields
Business fields
```

Example:

```json
{
  "id": 10,
  "name": "Test User",
  "email": "test@example.com",
  "status": "ACTIVE",
  "created_at": "...",
  "updated_at": "..."
}
```

The automation framework should validate the response against the expected schema.

---

# 13. Authentication Security Matrix

| Scenario                       | Expected |
| ------------------------------ | -------- |
| Valid credentials              | 200      |
| Invalid password               | 401      |
| Unknown user                   | 401      |
| Missing token                  | 401      |
| Invalid token                  | 401      |
| Expired token                  | 401      |
| USER accesses ADMIN operation  | 403      |
| ADMIN accesses ADMIN operation | Allowed  |

The exact status codes should follow the actual application implementation.

---

# 14. Authorization Matrix

| Operation   |                   ADMIN |         USER |
| ----------- | ----------------------: | -----------: |
| Login       |                       ✅ |            ✅ |
| View Users  |                       ✅ |            ✅ |
| View User   |                       ✅ |            ✅ |
| Create User |                       ✅ |            ❌ |
| Update User | Based on implementation | ❌/Restricted |
| Delete User |                       ✅ |            ❌ |

The test suite should validate authorization at the **API level**, not only by checking whether a UI button is visible.

---

# 15. CRUD Coverage Matrix

| Operation | UI | API | DB | E2E |
| --------- | -: | --: | -: | --: |
| Create    |  ✅ |   ✅ |  ✅ |   ✅ |
| Read      |  ✅ |   ✅ |  ✅ |   — |
| Update    |  ✅ |   ✅ |  ✅ |   ✅ |
| Delete    |  ✅ |   ✅ |  ✅ |   ✅ |

This gives us excellent cross-layer coverage.

---

# 16. Negative Testing Matrix

| Scenario               | UI | API | DB |
| ---------------------- | -: | --: | -: |
| Invalid email          |  ✅ |   ✅ |  — |
| Missing field          |  ✅ |   ✅ |  — |
| Duplicate email        |  ✅ |   ✅ |  ✅ |
| Non-existent user      |  — |   ✅ |  ✅ |
| Missing token          |  — |   ✅ |  — |
| Invalid token          |  — |   ✅ |  — |
| Unauthorized operation |  ✅ |   ✅ |  — |
| Plaintext password     |  — |   — |  ✅ |

---

# 17. Test Data Strategy

Tests should create unique data.

Example:

```python
email = f"sdet_{uuid4().hex[:8]}@test.com"
```

This prevents tests from depending on static data.

Example:

```text
sdet_a13f9d21@test.com
sdet_b7a231f9@test.com
sdet_8f1d3a92@test.com
```

---

# 18. Test Independence

Each test should be independently executable.

Bad:

```text
test_create
    ↓
test_update
    ↓
test_delete
```

because the second test depends on the first.

Better:

```text
test_create
    ↓
creates own data

test_update
    ↓
creates own data

test_delete
    ↓
creates own data
```

Each test owns its data.

---

# 19. Test Cleanup

Tests should clean up generated data.

Preferred lifecycle:

```text
Arrange
   ↓
Create test data
   ↓
Act
   ↓
Assert
   ↓
DB validation
   ↓
Cleanup
```

Example:

```text
Create User
     ↓
Run test
     ↓
Validate
     ↓
Delete User
```

---

# 20. Fixtures

The framework should eventually provide reusable fixtures.

Examples:

```text
admin_user
user_user
authenticated_admin
authenticated_user
api_client
db_client
created_user
```

This keeps test cases concise.

---

# 21. Example Test Architecture

The final test suite could look like:

```text
tests/
│
├── ui/
│   ├── test_login.py
│   └── test_users.py
│
├── api/
│   ├── test_auth.py
│   └── test_users.py
│
├── db/
│   └── test_users_db.py
│
└── e2e/
    └── test_user_lifecycle.py
```

Supporting code:

```text
framework/
│
├── ui/
├── api/
├── db/
├── auth/
├── data/
└── assertions/
```

We will design this properly before implementation.

---

# 22. Assertion Strategy

Avoid assertions that only validate that an operation completed.

Weak:

```python
assert response.status_code == 200
```

Better:

```python
assert response.status_code == 200
assert response.json()["email"] == email
assert response.json()["status"] == "ACTIVE"
```

Best for integrated scenarios:

```text
API Response
     +
Database State
     +
UI State
```

All three should agree.

---

# 23. API Assertion Layers

For every important API test:

```text
Layer 1
HTTP status

Layer 2
Response headers

Layer 3
Response schema

Layer 4
Response body

Layer 5
Business rules

Layer 6
Database state
```

This demonstrates mature API automation.

---

# 24. UI Assertion Layers

For important UI tests:

```text
Page state
    ↓
Element visibility
    ↓
Element state
    ↓
User-visible content
    ↓
Network/API result
    ↓
Database state
```

Example:

```text
User created
     ↓
Success message
     ↓
User visible
     ↓
POST succeeded
     ↓
DB record exists
```

---

# 25. Traceability

Every automated test should have a unique ID.

Example:

```text
UI-001
API-001
DB-001
AUTH-001
AUTHZ-001
E2E-001
```

This makes it easy to map:

```text
Requirement
    ↓
Test Scenario
    ↓
Automated Test
    ↓
Test Report
```

---

# 26. Recommended Automation Order

We should not start with UI automation.

Recommended implementation order:

```text
1. Framework foundation
        ↓
2. Configuration
        ↓
3. API client
        ↓
4. Authentication
        ↓
5. Database client
        ↓
6. API tests
        ↓
7. DB validation
        ↓
8. Playwright integration
        ↓
9. UI tests
        ↓
10. E2E tests
        ↓
11. Reporting
        ↓
12. CI/CD
```

This prevents the framework from becoming UI-centric.

---

# 27. Final Test Inventory

Our initial target is:

```text
UI
├── UI-001 Valid ADMIN login
├── UI-002 Valid USER login
├── UI-003 Invalid login
├── UI-004 Display users
├── UI-005 Create user
├── UI-006 Duplicate email
├── UI-007 Update user
└── UI-008 Delete user

API
├── API-001 Create user
├── API-002 Get user
├── API-003 Get users
├── API-004 Update user
├── API-005 Delete user
├── API-006 Non-existent user
├── API-007 Duplicate email
└── API-008 Invalid payload

Authentication
├── AUTH-001 Valid login
├── AUTH-002 Invalid password
├── AUTH-003 Missing authentication
└── AUTH-004 Invalid token

Authorization
├── AUTHZ-001 ADMIN create
├── AUTHZ-002 USER create denied
└── AUTHZ-003 USER delete denied

Database
├── DB-001 Create persistence
├── DB-002 Update persistence
├── DB-003 Delete persistence
└── DB-004 Password hashing

E2E
├── E2E-001 UI → API → DB Create
├── E2E-002 UI → API → DB Update
└── E2E-003 UI → API → DB Delete
```

**Total: 31 scenarios**

---

# 28. Definition of Done

A scenario is considered automated when:

```text
☐ Test is independently executable
☐ Test has deterministic data
☐ Authentication is handled correctly
☐ Assertions validate actual behavior
☐ API response is validated where applicable
☐ Database state is validated where applicable
☐ Cleanup is performed
☐ Failure diagnostics are available
☐ Test is tagged
☐ Test can run locally
☐ Test can run in CI
```

---

# 29. Senior SDET Coverage

This small application will allow us to demonstrate:

```text
                 SENIOR SDET SKILLS

                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
      UI                API                DB
  Playwright           HTTPX           PostgreSQL
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                Authentication
                         │
                         ▼
                 Authorization
                         │
                         ▼
                  Test Strategy
                         │
                         ▼
                   Test Data
                         │
                         ▼
                    Fixtures
                         │
                         ▼
                     Pytest
                         │
                         ▼
                     Allure
                         │
                         ▼
                     CI/CD
```

---

# 30. Next Phase

The application itself is now sufficiently defined for automation.

We have:

```text
README
    ↓
Application Setup
    ↓
Authentication
    ↓
Authorization
    ↓
Database Guide
    ↓
UI Guide
    ↓
Test Scenarios
```

The next phase is **not to immediately write 31 tests**.

We will first design the automation framework architecture.

Target structure:

```text
sdet-automation-framework/
│
├── config/
├── framework/
│   ├── api/
│   ├── ui/
│   ├── db/
│   ├── auth/
│   ├── assertions/
│   └── utils/
│
├── tests/
│   ├── api/
│   ├── ui/
│   ├── db/
│   └── e2e/
│
├── test-data/
├── reports/
├── conftest.py
├── pytest.ini
├── pyproject.toml
└── README.md
```

The framework will be designed to demonstrate **composition, fixtures, dependency management, configuration, API/UI/DB separation, parallel execution, retries, logging, reporting, and CI/CD**.

That architecture is the next step.
