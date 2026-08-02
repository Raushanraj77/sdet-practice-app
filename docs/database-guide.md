# SDET Practice Application — Database Guide

## 1. Overview

The SDET Practice Application uses **PostgreSQL** as its persistent database.

The database runs inside Docker and the FastAPI application communicates with it through SQLAlchemy.

The architecture is:

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
   │
   ▼
Docker Container
```

The database is an important part of the SDET practice environment because our automation framework will validate not only API/UI responses but also the actual persisted database state.

---

# 2. Technology Stack

| Component          | Technology       |
| ------------------ | ---------------- |
| Database           | PostgreSQL       |
| Database Container | Docker           |
| ORM                | SQLAlchemy       |
| PostgreSQL Driver  | psycopg          |
| Application        | FastAPI          |
| DB Validation      | SQL              |
| Future Automation  | Pytest + psycopg |

---

# 3. Database Configuration

The application reads the database connection string from the environment.

Example:

```text
DATABASE_URL=postgresql+psycopg://sdet_user:sdet_password@localhost:5432/sdet_practice
```

The connection contains:

```text
postgresql+psycopg
        │
        └── Database driver

sdet_user
        │
        └── Database username

sdet_password
        │
        └── Database password

localhost
        │
        └── Database host

5432
        │
        └── PostgreSQL port

sdet_practice
        │
        └── Database name
```

> Keep credentials in `.env` or environment variables. Do not commit secrets to Git.

---

# 4. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

You should see the PostgreSQL container.

Example:

```text
sdet-postgres
```

---

# 5. Check PostgreSQL Container

Run:

```bash
docker ps | grep sdet-postgres
```

If the container is running, PostgreSQL is available.

You can also inspect logs:

```bash
docker logs sdet-postgres
```

---

# 6. Connect to PostgreSQL

Use:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

Successful connection:

```text
psql (...)
Type "help" for help.

sdet_practice=#
```

---

# 7. PostgreSQL Useful Commands

Inside `psql`:

### List databases

```sql
\l
```

### List tables

```sql
\dt
```

### Describe a table

```sql
\d users
```

### List schemas

```sql
\dn
```

### Exit

```sql
\q
```

---

# 8. Current Database

Database:

```text
sdet_practice
```

Schema:

```text
public
```

Current application table:

```text
users
```

Verify:

```sql
\dt
```

Expected:

```text
 Schema | Name  | Type  | Owner
--------+-------+-------+-----------
 public | users | table | sdet_user
```

---

# 9. Users Table

The application currently uses a `users` table.

Conceptually:

```text
users
│
├── id
├── name
├── email
├── password_hash
├── role
├── status
├── created_at
└── updated_at
```

The exact columns should always be verified against the current SQLAlchemy model and database schema.

---

# 10. Inspect Users Table

Run:

```sql
\d users
```

This displays:

* Columns
* Data types
* Nullable settings
* Defaults
* Constraints
* Indexes

This command is especially useful when developing database validation tests.

---

# 11. Query All Users

Basic query:

```sql
SELECT *
FROM users;
```

For cleaner validation:

```sql
SELECT
    id,
    name,
    email,
    status,
    created_at,
    updated_at
FROM users
ORDER BY id;
```

---

# 12. Find User by ID

Example:

```sql
SELECT *
FROM users
WHERE id = 1;
```

Expected result:

```text
One user record
```

If no record exists:

```text
0 rows
```

---

# 13. Find User by Email

Example:

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

This is one of the most useful queries for API automation.

Example workflow:

```text
POST /users
      ↓
201 Created
      ↓
Extract email
      ↓
SELECT user WHERE email = ?
      ↓
Validate DB
```

---

# 14. Count Users

Run:

```sql
SELECT COUNT(*)
FROM users;
```

This can be useful for validating collection-level operations.

For example:

```text
Before Create
      ↓
COUNT = 5

Create User
      ↓
COUNT = 6
```

---

# 15. Verify User Status

Example:

```sql
SELECT
    id,
    email,
    status
FROM users
WHERE email = 'user@example.com';
```

Expected:

```text
status = ACTIVE
```

---

# 16. Verify User Role

If the current schema contains a role column:

```sql
SELECT
    id,
    email,
    role
FROM users
WHERE email = 'admin@sdet.test';
```

Expected:

```text
role = ADMIN
```

For a normal user:

```text
role = USER
```

---

# 17. Password Security Validation

Never validate passwords by expecting plaintext values in the database.

Instead:

```sql
SELECT
    email,
    password_hash
FROM users
WHERE email = 'user@example.com';
```

Expected:

```text
password_hash != original password
```

The important validation is:

```text
Password
   ↓
Hash
   ↓
Database
```

not:

```text
Password
   ↓
Plaintext Database Value
```

---

# 18. Password Should Not Appear in API Response

Create a user through API.

Example:

```http
POST /users
```

Then verify the response does not contain:

```text
password
```

or:

```text
password_hash
```

This gives us a cross-layer security test:

```text
API Response
      │
      ├── password absent ✅
      │
      └── password_hash absent ✅

Database
      │
      └── password_hash exists ✅
```

---

# 19. Created Timestamp

When a user is created, `created_at` should be populated.

Query:

```sql
SELECT
    id,
    email,
    created_at
FROM users
WHERE email = 'user@example.com';
```

Expected:

```text
created_at IS NOT NULL
```

---

# 20. Updated Timestamp

After updating a user:

```sql
SELECT
    id,
    email,
    updated_at
FROM users
WHERE id = 1;
```

The `updated_at` value should reflect the update according to the application's implementation.

This becomes a useful database assertion.

---

# 21. API → Database Validation

This is one of the most important patterns in our SDET project.

Example:

```text
             API
              │
              ▼
       POST /users
              │
              ▼
         201 Created
              │
              ▼
       Extract user ID
              │
              ▼
        PostgreSQL
              │
              ▼
      SELECT user WHERE id
              │
              ▼
        Compare Data
```

The test should validate both layers.

---

# 22. Create User — DB Validation

### Step 1

Send:

```http
POST /users
```

Example:

```json
{
  "name": "DB Validation User",
  "email": "db_validation@test.com",
  "password": "Test@123"
}
```

### Step 2

Verify:

```text
201 Created
```

### Step 3

Extract:

```text
id
email
name
status
```

### Step 4

Query:

```sql
SELECT
    id,
    name,
    email,
    status
FROM users
WHERE email = 'db_validation@test.com';
```

### Step 5

Compare:

```text
API ID       == DB ID
API name     == DB name
API email    == DB email
API status   == DB status
```

---

# 23. Update User — DB Validation

API:

```http
PUT /users/{id}
```

Example:

```json
{
  "name": "Updated DB User",
  "email": "updated_db@test.com",
  "password": "Updated@123"
}
```

Expected:

```text
200 OK
```

Then:

```sql
SELECT
    id,
    name,
    email,
    updated_at
FROM users
WHERE id = 1;
```

Validate:

```text
API name
    ==
DB name

API email
    ==
DB email
```

---

# 24. Delete User — DB Validation

API:

```http
DELETE /users/{id}
```

Expected:

```text
204 No Content
```

Then:

```sql
SELECT *
FROM users
WHERE id = 1;
```

Expected:

```text
0 rows
```

This proves that the deletion was actually persisted.

---

# 25. API → DB Test Lifecycle

The complete lifecycle:

```text
Create
   ↓
API Response
   ↓
Database Validation
   ↓
Update
   ↓
Database Validation
   ↓
Delete
   ↓
Database Validation
```

This will eventually become one of our major integration test scenarios.

---

# 26. UI → API → Database Validation

Our final end-to-end validation can span all three layers.

```text
              Browser
                 │
                 ▼
              Login
                 │
                 ▼
            User Action
                 │
                 ▼
                API
                 │
                 ▼
            PostgreSQL
                 │
                 ▼
           Database State
```

Example:

```text
UI: Create User
       ↓
POST /users
       ↓
201 Created
       ↓
User appears in UI
       ↓
SELECT from PostgreSQL
       ↓
Validate DB record
```

This is the kind of workflow that demonstrates strong Senior SDET capabilities.

---

# 27. Database Test Isolation

Tests should not depend on data created by previous tests.

Bad:

```text
test_create_user
       ↓
test_update_user
       ↓
test_delete_user
```

where each test depends on the previous test.

Prefer:

```text
test_create_user
    ↓
Creates own data
    ↓
Validates
    ↓
Cleans up

test_update_user
    ↓
Creates own data
    ↓
Validates
    ↓
Cleans up
```

---

# 28. Test Data Cleanup

Recommended pattern:

```text
Arrange
   ↓
Create Test Data
   ↓
Act
   ↓
Run API/UI operation
   ↓
Assert
   ↓
Database Validation
   ↓
Cleanup
```

Example:

```text
Create user
     ↓
Run test
     ↓
Validate
     ↓
DELETE user
```

This keeps the environment clean.

---

# 29. Database Client for Automation

Later we will build a reusable database client.

Conceptually:

```python
class DatabaseClient:
    def execute_query(self, query, params=None): ...

    def fetch_one(self, query, params=None): ...

    def fetch_all(self, query, params=None): ...

    def execute_update(self, query, params=None): ...
```

The test should not contain raw database connection logic everywhere.

Bad:

```python
conn = psycopg.connect(...)
cursor = conn.cursor()
...
```

inside every test.

Better:

```python
db.fetch_one(
    "SELECT * FROM users WHERE email = %s",
    (email,),
)
```

---

# 30. Database Layer Design

The future automation framework should separate:

```text
Test
 │
 ▼
Database Client
 │
 ▼
SQL Query / Repository
 │
 ▼
PostgreSQL
```

For example:

```text
tests/
    test_users.py

db/
    client.py
    queries.py
```

This follows separation of concerns.

---

# 31. Parameterized SQL

Always prefer parameterized queries.

Avoid:

```python
query = f"""
SELECT *
FROM users
WHERE email = '{email}'
"""
```

Prefer:

```python
query = """
SELECT *
FROM users
WHERE email = %s
"""
```

with:

```python
params = (email,)
```

This avoids SQL injection risks and improves query handling.

---

# 32. Important SQL Queries

### All users

```sql
SELECT * FROM users;
```

### User by ID

```sql
SELECT *
FROM users
WHERE id = %s;
```

### User by email

```sql
SELECT *
FROM users
WHERE email = %s;
```

### Count users

```sql
SELECT COUNT(*)
FROM users;
```

### Active users

```sql
SELECT *
FROM users
WHERE status = 'ACTIVE';
```

### Delete test user

```sql
DELETE FROM users
WHERE email = %s;
```

---

# 33. Database Negative Scenarios

Database-related automation should validate:

```text
DB-NEG-001 User does not exist
DB-NEG-002 Duplicate email rejected
DB-NEG-003 Deleted user no longer exists
DB-NEG-004 Invalid user ID
DB-NEG-005 Required fields cannot be NULL
DB-NEG-006 Email uniqueness enforced
DB-NEG-007 Password not stored plaintext
```

---

# 34. Data Integrity Tests

Important validations:

```text
☐ ID is unique
☐ Email is unique
☐ Required fields are populated
☐ Status has valid value
☐ Role has valid value
☐ Password hash exists
☐ created_at exists
☐ updated_at is maintained
```

---

# 35. Database Schema Validation

The automation framework should eventually be able to validate the database structure itself.

For example:

```text
Table exists
      ↓
users
      ↓
Expected columns
      ↓
id
name
email
password_hash
role
status
created_at
updated_at
```

This can be useful as an environment sanity check.

---

# 36. Docker Database Lifecycle

The local development lifecycle is:

```text
docker compose up -d
        ↓
PostgreSQL starts
        ↓
FastAPI starts
        ↓
Application connects to DB
        ↓
Tests execute
        ↓
Tests complete
        ↓
docker compose down
```

To stop containers:

```bash
docker compose down
```

To stop and remove database volumes:

```bash
docker compose down -v
```

> `docker compose down -v` deletes the PostgreSQL volume and therefore removes persisted local database data. Use it carefully.

---

# 37. Database Reset

For a completely fresh local environment:

```bash
docker compose down -v
docker compose up -d
```

Then start FastAPI:

```bash
uvicorn app.main:app --reload
```

The database will start from a clean state.

---

# 38. Database Troubleshooting

### PostgreSQL container not running

Check:

```bash
docker ps
```

Start:

```bash
docker compose up -d
```

---

### Cannot connect to database

Check:

```bash
docker logs sdet-postgres
```

Then verify:

```bash
docker exec -it sdet-postgres psql \
  -U sdet_user \
  -d sdet_practice
```

---

### No tables

Inside PostgreSQL:

```sql
\dt
```

If no tables exist, verify that the application has started and SQLAlchemy model initialization has executed.

---

### Check table structure

```sql
\d users
```

---

# 39. Database Validation Checklist

Before automation:

```text
☐ PostgreSQL starts through Docker
☐ Application connects successfully
☐ Database exists
☐ users table exists
☐ User records can be queried
☐ User can be found by ID
☐ User can be found by email
☐ User creation persists
☐ User update persists
☐ User deletion persists
☐ Password is hashed
☐ Password is not returned by API
☐ Role persists
☐ Status persists
☐ created_at is populated
☐ updated_at is maintained
```

---

# 40. Senior SDET Database Testing Goals

The database layer allows us to demonstrate:

```text
SQL
PostgreSQL
Docker
SQLAlchemy
Database connectivity
CRUD validation
Data integrity
Data consistency
API → DB validation
UI → API → DB validation
Test data management
Cleanup
Security validation
```

---

# 41. Final Data Flow

The complete application data flow:

```text
                         UI
                          │
                          ▼
                       FastAPI
                          │
                          ▼
                         API
                          │
                          ▼
                      SQLAlchemy
                          │
                          ▼
                        psycopg
                          │
                          ▼
                      PostgreSQL
                          │
                          ▼
                         Data
```

For SDET validation:

```text
UI
 │
 ├────► Verify UI behavior
 │
 ▼
API
 │
 ├────► Verify status/schema/business logic
 │
 ▼
Database
 │
 └────► Verify persisted state
```

---

# 42. Target Automation Architecture

Once documentation is complete, the automation framework will look like:

```text
                    PYTEST
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        UI Tests     API Tests     DB Tests
          │            │            │
          ▼            ▼            ▼
      Playwright     HTTPX       psycopg
          │            │            │
          └────────────┼────────────┘
                       ▼
                SDET Practice App
                       │
                       ▼
                  PostgreSQL
```

And the most valuable integrated tests:

```text
UI → API
API → DB
UI → API → DB
```

---

# 43. Next Step

The database layer is now documented.

The next document should be:

```text
docs/ui-guide.md
```

That document will describe:

```text
Login Page
     ↓
Dashboard
     ↓
Users Page
     ↓
Create User
     ↓
Edit User
     ↓
Delete User
     ↓
Logout
```

After that, we'll create:

```text
docs/test-scenarios.md
```

That is where we'll finally convert everything we've built into **real SDET test cases**, including:

* UI tests
* API tests
* Database tests
* Authentication tests
* Authorization tests
* Negative tests
* End-to-end tests
* API → DB tests
* UI → API → DB tests

Then we can start building the actual **Senior SDET automation framework**.
