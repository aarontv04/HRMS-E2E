# 🧾 Human Resource Management System (E2E Tested with Cypress)

A full-stack **Human Resource Management (HRM) system** built using **ASP.NET Core (.NET 8 MVC)** and SQL Server.

The application helps manage:

* Employees
* Payroll
* Attendance

It also includes **end-to-end test automation using Cypress**.

---

## 🚀 Overview

This project simulates a real-world HR system with:

* Clean backend structure
* Practical business workflows
* Automated testing for key features

---

## 🏗️ Tech Stack

### Backend

* ASP.NET Core (.NET 8 MVC)
* Entity Framework Core 8
* SQL Server

### Frontend

* HTML, CSS, JavaScript

### UI Components

* DevExtreme

### Testing

* Cypress

### Other Tools

* Newtonsoft.Json
* Font Awesome

---

## 🗄️ Database

The system uses a relational database with tables such as:

* Departments
* Positions
* Employees
* PayrollRecords
* AttendanceRecords

Sample data is included for testing.

---

## 📦 Features

### 📊 Dashboard

* KPI cards
* Department-wise employee count
* Payroll trends
![Dashboard](images/dashboard.png)

---

### 👥 Employee Management

* Add, update, delete employees
* Search and filter
* Auto-generated employee IDs (EMP001, EMP002…)
![Employee Management](images/employee.png)

---

### 💰 Payroll

* Workflow:

  ```
  Draft → Approved → Paid
  ```
* Automatic salary and deduction calculations

---

### ⏱ Attendance

* Check-in and check-out tracking
* Late detection
* Work hour calculation

---

## 🔐 Authentication

* Cookie-based login system
* Password hashing with BCrypt
* Roles:

  * Admin
  * HR Manager
  * Staff
	
![Authentication](images/authentication.png)

---

# 🧪 Test Automation (Cypress)

## Overview

A **Cypress end-to-end test suite** validates key parts of the system.

* 7 spec files
* ~90 test cases
* Focus on authentication, dashboard, and employees

---

## ⚙️ Setup

* Located in `cypress-tests` folder
* Configured with:

  * Base URL: `https://localhost:5001`
  * Increased timeouts
  * Video recording enabled
  * HTTPS handling (`chromeWebSecurity: false`)

### Run Tests

```bash id="3rvjxf"
npm run cy:open   # interactive mode
npm run cy:run    # headless mode
```

---

## 🔧 Custom Commands

Reusable Cypress commands:

* `cy.login()` → Session-based login
* `cy.apiRequest()` → Handles authenticated API calls
* `cy.navigateTo()` → Reliable navigation
* `cy.waitForGrid()` → Stable DataGrid loading
* `cy.fillDxInput()` → Input handling
* `cy.selectDxDropdown()` → Dropdown handling

---

## 📋 Test Coverage

### 🔐 Authentication

* Login for all roles
* Invalid login handling
* Session persistence
* Logout flows
* Unauthorized API checks

---

### 📊 Dashboard

* API validation
* KPI checks
* Chart presence

---

### 👥 Employees

* Full CRUD testing
* API + UI validation
* Search and filtering
* Duplicate handling
* Cleanup after tests

---

### ⚠️ Not Covered Yet

* Payroll
* Attendance
* Navigation

---

## 🐞 Challenges Solved

* Fixed date handling between frontend and backend
* Resolved JSON format mismatches
* Handled LINQ query limitations
* Fixed UI component issues
* Solved Cypress authentication (401 errors using cookies)

---

## ▶️ How to Run

1. Clone the repository
2. Update database connection in `appsettings.json`
3. Run:

```bash id="dl4dks"
dotnet run
```

4. Open:

```id="06k57t"
https://localhost:<port>
```

---

## 🎯 Highlights

* Complete HR system with real workflows
* Clean backend structure
* Cypress-based E2E testing
* Practical, industry-relevant project

---

## 👨‍💻 Author

**Aaron Tom**
