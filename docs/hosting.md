# SDET Practice App — Hosted Environment

## Overview

The **SDET Practice App** is now deployed as a publicly accessible application using **Render**.

This hosted environment allows QA/SDET engineers to practice **UI automation, API automation, API validation, and end-to-end testing** against a real remotely hosted application without requiring local setup.

---

## Hosted Application

### Application UI

**Live Application:**

https://sdet-practice-app.onrender.com

The application provides the user-facing UI used for practicing browser automation with tools such as:

* Playwright
* Selenium
* Cypress
* WebDriver-based frameworks
* Python automation
* TypeScript automation

---

## API Documentation

The application exposes interactive **Swagger/OpenAPI documentation**.

### Swagger UI

https://sdet-practice-app.onrender.com/docs

Swagger UI can be used to:

* Explore available APIs
* Understand request/response contracts
* Execute API requests directly
* Validate HTTP status codes
* Inspect JSON responses
* Practice API automation
* Understand API request parameters and payloads

---

## Hosted Architecture

The current deployment provides the following high-level flow:

```text
                    ┌─────────────────────────┐
                    │      QA / SDET          │
                    │                         │
                    │ Playwright / Selenium   │
                    │ Python / TypeScript     │
                    │ API Automation          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Render Hosting      │
                    │                         │
                    │   SDET Practice App     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌──────────────┐        ┌────────────────┐
             │   Web UI     │        │ REST API       │
             │              │        │                │
             │ Browser      │        │ Swagger / Docs │
             │ Automation   │        │ API Testing    │
             └──────────────┘        └────────────────┘
```

---

## Why Host the Application?

Previously, the application could be executed locally. Hosting it provides additional benefits for SDET practice and demonstrations.

### 1. No Local Application Setup

Test automation engineers can directly access the application without installing or running the backend locally.

### 2. Real Remote Testing

Automation can be executed against an externally hosted environment, making the setup closer to real-world enterprise testing.

### 3. UI Automation Practice

The hosted application can be used as a target for:

* Playwright
* Selenium
* Cypress
* Python automation
* TypeScript automation

### 4. API Automation Practice

The API can be accessed remotely through the hosted endpoint and Swagger documentation.

This enables automation scenarios such as:

* GET requests
* POST requests
* PUT/PATCH requests
* DELETE requests
* Request payload validation
* Response validation
* Status-code validation
* Negative testing
* Authentication testing where applicable
* JSON/schema validation

### 5. Interview Demonstration

The hosted application can also be used as a **live SDET portfolio project**.

Instead of explaining only the framework architecture, the project can be demonstrated end-to-end:

```text
Live Application
       ↓
UI Automation
       ↓
API Automation
       ↓
Assertions & Validation
       ↓
Reporting
       ↓
CI/CD
```

---

## Quick Access

| Component         | URL                                         |
| ----------------- | ------------------------------------------- |
| Live Application  | https://sdet-practice-app.onrender.com      |
| Swagger / OpenAPI | https://sdet-practice-app.onrender.com/docs |

---

## Recommended Automation Structure

A separate automation framework can consume the hosted application as its test environment:

```text
SDET Automation Framework
│
├── UI Tests
│   └── Playwright
│
├── API Tests
│   └── REST API
│
├── Test Data
│
├── Assertions
│
├── Reports
│
└── CI/CD
        │
        ▼
SDET Practice App
https://sdet-practice-app.onrender.com
```

---

## Environment Configuration

The hosted application URL should be maintained through environment configuration rather than hard-coded throughout the test framework.

Example:

```text
BASE_URL=https://sdet-practice-app.onrender.com
API_URL=https://sdet-practice-app.onrender.com
```

This allows the same automation framework to support multiple environments:

```text
Local
  ↓
Development
  ↓
QA
  ↓
Hosted / Demo
```

---

## Swagger / OpenAPI

Swagger UI is available at:

https://sdet-practice-app.onrender.com/docs

The Swagger interface can be used as the primary API reference when developing API automation tests.

For example:

```text
Swagger
   ↓
Understand API contract
   ↓
Create API test
   ↓
Send request
   ↓
Validate response
   ↓
Add assertions
   ↓
Execute through CI/CD
```

---

## Purpose of the Hosted Environment

The hosted SDET Practice App is intended to provide a reusable environment for:

* SDET interview preparation
* Playwright practice
* Selenium practice
* API automation practice
* Python automation
* TypeScript automation
* End-to-end testing
* API/UI integration testing
* CI/CD demonstrations
* Automation framework demonstrations
* Portfolio projects
* Proof-of-concept demonstrations

---

## Future Enhancements

The hosted environment can be extended with additional testing capabilities such as:

* Authentication and authorization scenarios
* Role-based access testing
* Database-backed test scenarios
* File upload/download testing
* Dynamic test data
* API chaining
* Negative API scenarios
* Contract testing
* JSON Schema validation
* WebSocket testing
* Performance testing
* Visual regression testing
* AI-assisted testing scenarios

---

## Status

**Application:** Hosted and accessible

**UI:** Available

**API:** Available

**Swagger/OpenAPI:** Available

**Environment:** Remote hosted environment

**Primary Use:** SDET / QA automation practice and demonstrations
