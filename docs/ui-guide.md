# SDET Practice Application — UI Guide

## 1. Overview

The SDET Practice Application includes a lightweight web UI built specifically for practicing real-world **UI automation with Playwright**.

The UI communicates with the FastAPI backend, which persists data in PostgreSQL.

The complete flow is:

```text
Browser
   │
   ▼
HTML / CSS / JavaScript
   │
   ▼
FastAPI
   │
   ▼
API
   │
   ▼
PostgreSQL
```

This allows us to build tests across all three layers:

```text
UI Testing
API Testing
Database Testing
```

and eventually combine them:

```text
UI → API → Database
```

---

# 2. UI Technology Stack

| Component          | Technology |
| ------------------ | ---------- |
| HTML               | HTML5      |
| Styling            | CSS        |
| Client-side logic  | JavaScript |
| Backend            | FastAPI    |
| Templates          | Jinja2     |
| API                | REST       |
| Database           | PostgreSQL |
| Browser Automation | Playwright |
| Future Language    | Python     |

The UI is intentionally lightweight.

The objective is not to build a production frontend framework.

The objective is to create a stable application that provides enough functionality for realistic SDET automation.

---

# 3. UI Application Structure

Current structure:

```text
app/
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── users.js
│
└── templates/
    └── index.html
```

Responsibilities:

```text
index.html
     │
     └── Page structure

style.css
     │
     └── Visual styling

users.js
     │
     └── API interaction + UI behavior
```

---

# 4. Application Entry Point

The application UI is served from:

```text
GET /
```

Open:

```text
http://127.0.0.1:8000/
```

or:

```text
http://localhost:8000/
```

The browser should display the application home page.

---

# 5. Application Pages

The current application is intentionally kept simple.

The UI flow is:

```text
                    Application
                         │
                         ▼
                       Login
                         │
                         ▼
                     Dashboard
                         │
                         ▼
                       Users
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Create          Update          Delete
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                      Logout
```

---

# 6. Login Page

The login page is the entry point for authenticated users.

Expected fields:

```text
Email
Password
Login
```

Example:

```text
Email:
admin@sdet.test

Password:
************
```

---

# 7. Login Success

When valid credentials are provided:

```text
Login
  ↓
Authentication
  ↓
JWT Access Token
  ↓
Authenticated Session
  ↓
Dashboard
```

The UI should transition to the authenticated application experience.

---

# 8. Invalid Login

When invalid credentials are provided:

```text
Login
  ↓
Authentication
  ↓
Invalid Credentials
  ↓
401 Unauthorized
  ↓
Error Message
```

The user should remain on the login page.

This is an important negative UI automation scenario.

---

# 9. Dashboard

After successful authentication, the user reaches the application dashboard.

The dashboard should provide access to the user management functionality.

Conceptually:

```text
┌───────────────────────────────────────────┐
│ SDET Practice Application       Logout    │
├───────────────────────────────────────────┤
│                                           │
│              Dashboard                    │
│                                           │
│      User Management                     │
│                                           │
│        [ Manage Users ]                  │
│                                           │
└───────────────────────────────────────────┘
```

---

# 10. Users Page

The users page displays application users.

Example:

```text
Users

+----+-------------+---------------------+--------+
| ID | Name        | Email               | Status |
+----+-------------+---------------------+--------+
| 1  | Admin User  | admin@sdet.test     | ACTIVE |
| 2  | Test User   | user@sdet.test      | ACTIVE |
+----+-------------+---------------------+--------+
```

The UI should retrieve this information from:

```text
GET /users
```

---

# 11. User List Flow

The complete flow:

```text
Open Users Page
      ↓
JavaScript
      ↓
GET /users
      ↓
FastAPI
      ↓
PostgreSQL
      ↓
JSON Response
      ↓
JavaScript
      ↓
Render Users
```

This provides a realistic opportunity to validate UI behavior against backend data.

---

# 12. Create User

ADMIN users can create users.

The UI should provide a Create User action.

Example:

```text
+--------------------------------+
| Create User                    |
+--------------------------------+
| Name:                          |
| [________________________]     |
|                                |
| Email:                         |
| [________________________]     |
|                                |
| Password:                      |
| [________________________]     |
|                                |
|          [ Create ]            |
+--------------------------------+
```

The UI sends:

```text
POST /users
```

---

# 13. Create User Flow

```text
User enters data
       ↓
Click Create
       ↓
Client-side validation
       ↓
POST /users
       ↓
Authentication
       ↓
Authorization
       ↓
FastAPI
       ↓
PostgreSQL
       ↓
201 Created
       ↓
Refresh user list
```

---

# 14. Create User Success

After successful creation:

```text
201 Created
```

The UI should:

```text
Show success message
       ↓
Refresh users
       ↓
Display newly created user
```

This gives us an excellent UI automation scenario.

---

# 15. Duplicate Email

The backend prevents duplicate emails.

Example:

```text
Existing:
user@sdet.test

Attempt:
user@sdet.test
```

Expected:

```text
409 Conflict
```

The UI should display a meaningful error.

Automation should verify:

```text
UI Error
+
API Status
+
Database State
```

---

# 16. Update User

ADMIN users can update an existing user.

Example:

```text
User
 ↓
Edit
 ↓
Update Name
 ↓
Update Email
 ↓
Save
```

API:

```text
PUT /users/{user_id}
```

---

# 17. Update User Flow

```text
Click Edit
     ↓
Edit Form
     ↓
Modify Data
     ↓
Click Save
     ↓
PUT /users/{id}
     ↓
API Response
     ↓
Refresh User List
```

Expected:

```text
200 OK
```

---

# 18. Update Validation

The UI should validate user input.

Examples:

```text
Empty name
Invalid email
Duplicate email
Missing password
```

The exact validation rules should follow the current API contract.

Automation should verify both client-side and server-side validation where applicable.

---

# 19. Delete User

ADMIN users can delete users.

Example:

```text
Users
  ↓
Delete
  ↓
Confirmation
  ↓
DELETE /users/{id}
  ↓
204 No Content
  ↓
Refresh List
```

---

# 20. Delete Confirmation

A confirmation step is recommended.

Example:

```text
Are you sure you want to delete this user?

[Cancel]       [Delete]
```

This provides a useful Playwright scenario involving:

```text
Dialog interaction
Button state
Confirmation
API validation
Database validation
```

---

# 21. Delete Success

After successful deletion:

```text
204 No Content
```

The UI should:

```text
Remove user from list
       ↓
Show success feedback
```

Database validation:

```sql
SELECT *
FROM users
WHERE id = <deleted_user_id>;
```

Expected:

```text
0 rows
```

---

# 22. USER Role UI

A normal USER should have restricted functionality.

Example:

```text
USER
 │
 ├── View Users       ✅
 │
 ├── View User        ✅
 │
 ├── Create User      ❌
 │
 ├── Edit User        ❌
 │
 └── Delete User      ❌
```

Depending on the application's implementation, restricted controls can either:

```text
Be hidden
```

or:

```text
Be visible but rejected by the backend
```

The automation framework should validate the actual behavior implemented by the application.

---

# 23. ADMIN Role UI

ADMIN should have access to user-management operations.

```text
ADMIN
 │
 ├── View Users       ✅
 ├── View User        ✅
 ├── Create User      ✅
 ├── Edit User        ✅
 └── Delete User      ✅
```

This allows us to test role-based UI behavior.

---

# 24. Logout

The logout functionality terminates the authenticated client session.

Flow:

```text
Authenticated User
       ↓
Click Logout
       ↓
Clear Authentication State
       ↓
Return to Login
```

After logout, attempting to access protected functionality should require authentication again.

---

# 25. Protected UI Access

A user who is not authenticated should not be able to access protected functionality.

Example:

```text
No Token
   ↓
Open Users
   ↓
Authentication Required
   ↓
401 / Redirect
```

This is an important security scenario.

---

# 26. UI State Management

The UI should maintain authentication state appropriately.

Conceptually:

```text
                    Application
                         │
              ┌──────────┴──────────┐
              │                     │
        Unauthenticated       Authenticated
              │                     │
              ▼                     ▼
            Login                Dashboard
                                    │
                                    ▼
                                  Users
```

The automation framework should verify transitions between these states.

---

# 27. UI Test Scenarios

The UI should provide enough functionality for approximately **10 core UI scenarios**.

### UI-001 — Login with valid ADMIN

```text
Given user is on login page
When ADMIN credentials are entered
And Login is clicked
Then dashboard should be displayed
```

---

### UI-002 — Login with valid USER

```text
Given user is on login page
When USER credentials are entered
Then dashboard should be displayed
```

---

### UI-003 — Invalid login

```text
Given user is on login page
When invalid credentials are entered
Then login should fail
And error should be displayed
```

---

### UI-004 — Display users

```text
Given ADMIN is logged in
When Users page is opened
Then users should be displayed
```

---

### UI-005 — Create user

```text
Given ADMIN is logged in
When valid user details are entered
And Create is clicked
Then user should be created
```

---

### UI-006 — Duplicate user

```text
Given a user already exists
When the same email is submitted
Then an appropriate error should be displayed
```

---

### UI-007 — Update user

```text
Given ADMIN is logged in
When an existing user is edited
Then updated information should be displayed
```

---

### UI-008 — Delete user

```text
Given ADMIN is logged in
When a user is deleted
Then the user should disappear from the list
```

---

### UI-009 — USER authorization

```text
Given USER is logged in
When an ADMIN operation is attempted
Then the operation should be rejected
```

---

### UI-010 — Logout

```text
Given user is authenticated
When Logout is clicked
Then the user should return to login
```

---

# 28. UI Negative Scenarios

Negative testing is essential.

Examples:

```text
Empty email
Invalid email
Empty password
Invalid password
Duplicate email
Unauthorized operation
Expired/invalid token
Non-existent user
Delete already deleted user
Invalid user ID
```

---

# 29. Playwright Locator Strategy

The UI should be designed so that automation can use stable locators.

Preferred:

```text
data-testid
id
role
label
accessible name
```

Example:

```html
<button data-testid="login-button">
    Login
</button>
```

Then Playwright:

```python
page.get_by_test_id("login-button")
```

Another example:

```html
<input
    data-testid="email-input"
    type="email"
/>
```

Automation:

```python
page.get_by_test_id("email-input")
```

---

# 30. Locator Priority

Use this priority:

```text
1. data-testid
2. Accessible role/name
3. Label
4. ID
5. Stable CSS
6. XPath — last resort
```

Avoid:

```text
button:nth-child(3)
```

or:

```text
div > div > button
```

These selectors are fragile.

---

# 31. Recommended Test IDs

The UI should expose predictable test IDs.

Example:

```text
login-email
login-password
login-button

logout-button

users-page
create-user-button

user-name
user-email
user-password
save-user-button

edit-user-button
delete-user-button
confirm-delete-button
cancel-delete-button

success-message
error-message
users-table
user-row
```

This makes the application automation-friendly.

---

# 32. Playwright Page Object Model

Our future automation framework should model UI pages separately.

Example:

```text
ui/
├── pages/
│   ├── login_page.py
│   ├── dashboard_page.py
│   └── users_page.py
│
└── components/
    └── user_form.py
```

Example:

```python
class LoginPage:
    def login(self, email: str, password: str): ...
```

The test should then be readable:

```python
login_page.login(
    email,
    password,
)
```

instead of containing raw selectors everywhere.

---

# 33. UI + API Validation

A strong SDET test should not stop at:

```text
User appears in UI
```

We should validate:

```text
UI
 ↓
API
 ↓
Database
```

Example:

```text
Click Create User
       ↓
UI displays user
       ↓
API returns 201
       ↓
Database contains user
```

---

# 34. UI + Database Validation

Example scenario:

```text
Create User from UI
        ↓
Capture email
        ↓
Query PostgreSQL
        ↓
Find user
        ↓
Validate:
    name
    email
    status
    role
    timestamps
```

This is a powerful end-to-end validation.

---

# 35. Authentication UI Tests

Authentication automation should cover:

```text
☐ Valid ADMIN login
☐ Valid USER login
☐ Invalid password
☐ Invalid email
☐ Empty credentials
☐ Logout
☐ Protected page without login
☐ Invalid/expired session
```

---

# 36. Authorization UI Tests

Authorization automation should cover:

```text
☐ ADMIN can create
☐ ADMIN can update
☐ ADMIN can delete
☐ USER cannot create
☐ USER cannot update
☐ USER cannot delete
```

---

# 37. UI Test Data Strategy

Do not hardcode user data in every test.

Instead:

```text
test-data/
├── users.json
├── users.yaml
└── users.csv
```

Example:

```json
{
  "admin": {
    "email": "admin@sdet.test",
    "password": "Admin@123"
  },
  "user": {
    "email": "user@sdet.test",
    "password": "User@123"
  }
}
```

For real projects, passwords should be stored using environment variables or secret management rather than committed files.

---

# 38. UI Automation Principles

The framework should follow:

```text
Stable Locators
     ↓
Page Object Model
     ↓
Reusable Fixtures
     ↓
Independent Tests
     ↓
Test Data Management
     ↓
API Helpers
     ↓
DB Helpers
     ↓
Assertions
```

Avoid putting everything inside a single test file.

---

# 39. Browser Coverage

Playwright allows us to eventually run the same UI suite against:

```text
Chromium
Firefox
WebKit
```

Our first implementation can use Chromium.

Later:

```text
pytest
  │
  ├── Chromium
  ├── Firefox
  └── WebKit
```

---

# 40. UI Test Execution

Future commands will look similar to:

```bash
pytest tests/ui
```

For a specific test:

```bash
pytest tests/ui/test_login.py
```

For headed execution:

```bash
pytest tests/ui --headed
```

The exact command will depend on the final Playwright + pytest framework implementation.

---

# 41. UI Test Reporting

The final framework should support:

```text
Test
 ↓
Playwright
 ↓
Assertion
 ↓
Screenshot on failure
 ↓
Trace on failure
 ↓
Allure
```

For failed tests, we should capture:

```text
Screenshot
Video where appropriate
Trace
Console logs
Network information
```

This will make debugging much easier.

---

# 42. UI Test Pyramid

Our test strategy should not put everything into UI tests.

Recommended:

```text
             ┌───────────┐
             │    E2E     │
             │ UI+API+DB  │
             └───────────┘
           ┌───────────────┐
           │      UI       │
           └───────────────┘
        ┌─────────────────────┐
        │         API         │
        └─────────────────────┘
     ┌───────────────────────────┐
     │       Unit / Service      │
     └───────────────────────────┘
```

Most business rules should be validated at the API/service level.

UI tests should focus on:

```text
User journeys
Critical workflows
UI behavior
Integration points
Authentication
Authorization
```

---

# 43. UI → API → DB Example

A complete test:

```text
1. Login through UI
        ↓
2. Open Users
        ↓
3. Create User
        ↓
4. UI sends POST /users
        ↓
5. API returns 201
        ↓
6. UI displays user
        ↓
7. Query PostgreSQL
        ↓
8. Validate database record
```

Assertions:

```text
UI assertion
+
API assertion
+
Database assertion
```

This will become one of our flagship Senior SDET scenarios.

---

# 44. UI Checklist

Before moving to automation:

```text
Application
☐ Login works
☐ Dashboard works
☐ Users page works
☐ Create user works
☐ Update user works
☐ Delete user works
☐ Logout works

Authentication
☐ ADMIN login
☐ USER login
☐ Invalid login
☐ Protected access

Authorization
☐ ADMIN permissions
☐ USER restrictions

Validation
☐ Required fields
☐ Invalid email
☐ Duplicate email
☐ API errors displayed

Automation
☐ Stable test IDs
☐ Accessible elements
☐ Predictable page structure
☐ No fragile selectors
```

---

# 45. Final Application Architecture

After completing the UI layer, our practice application becomes:

```text
                 SDET PRACTICE APPLICATION
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
         UI               API               DB
          │                │                │
     HTML/CSS/JS         FastAPI         PostgreSQL
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                     Docker Runtime
```

And our eventual automation framework:

```text
                         PYTEST
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Playwright            HTTPX              psycopg
        │                   │                   │
        ▼                   ▼                   ▼
       UI                  API                  DB
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    SDET Test Scenarios
                            │
                            ▼
                         Allure
                            │
                            ▼
                     CI/CD Pipeline
```

---

# 46. Next Step

The application documentation is now covering:

```text
README
   │
   ├── Authentication & Authorization
   │
   ├── Database
   │
   └── UI
```

The next and most important document is:

```text
docs/test-scenarios.md
```

This will define the actual test inventory before we write automation code.

Target:

```text
                 ~30 focused tests

UI                  ~10
API                  ~10
Database              ~5
Authentication        ~5
Authorization         ~5
E2E / Integration     ~5
```

We will **not blindly automate everything**. We'll select a compact set of high-value scenarios so the final project demonstrates Senior SDET skills without becoming unnecessarily large.
