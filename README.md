# Team-2 Daily Habit Checklist

A web-based application for Republic Polytechnic students to track daily calorie intake and manage personal habits. Students can log food items, monitor their calorie consumption, and complete daily habit checklists. Administrators can manage users and monitor student activity.

This project demonstrates modern DevOps practices including:

* Git & GitHub Collaboration (Branching, Pull Requests)
* Docker Containerization
* Jenkins CI/CD Pipeline
* Ansible Deployment Automation

> **Note:** The application uses JSON files for persistent storage to keep data transparent and easily inspectable for grading purposes.

---

## 🚀 Features

### Student / User Features

* ✅ Registration with RP email validation (`@myrp.edu.sg`)
* 🔐 Secure login/logout using server-side sessions
* 👤 View personal profile and account details
* 🍔 Log daily food items with calorie counts
* 📊 View total calorie intake summary
* ✔️ Track daily habits through a checklist system
* 📅 Monitor monthly progress
* 💾 Automatic progress saving
* 🎯 Set and edit daily calorie goals for any day
* 📈 View daily calorie progress with goal, food eaten, and remaining calories
* 🧮 Use a BMI calculator with age, gender, height, weight, and exercise level
* 💡 Get a recommended daily calorie intake suggestion
* 🗓️ See calendar status colors for calorie goal performance

### Habit Tracking Features

The Daily Habit Checklist allows users to track two habits daily:

* Calorie Goal Completion
* Fitness Workout Completion

The Daily Goals experience now also supports:

* Daily calorie goals saved to local storage
* Daily calorie progress summary with remaining calories
* Calendar day colors for calorie goal status
* Food entries that feed into the daily calorie progress view

Users can monitor their consistency through a ranking system:

| Completion Percentage | Rank   |
| --------------------- | ------ |
| 0% - 25%              | Iron   |
| 26% - 50%             | Bronze |
| 51% - 75%             | Silver |
| 76% - 100%            | Gold   |

### Calendar Color Guide

| Status | Meaning |
| ------ | ------- |
| Green | Goal reached |
| Red | Over or under goal |
| Grey | No goal set |

### Admin Features

* 👥 View all registered users
* 📈 View detailed user statistics
* 🗑️ Delete user accounts
* 📊 Monitor user activity metrics

---

## 🛠️ Technologies Used

| Area             | Technologies          |
| ---------------- | --------------------- |
| Backend          | Node.js, Express.js   |
| Frontend         | HTML, CSS, JavaScript |
| Storage          | JSON Files            |
| Authentication   | Express Session       |
| Version Control  | Git, GitHub           |
| Containerization | Docker                |
| CI/CD            | Jenkins               |
| Automation       | Ansible               |

---

## 🏗️ System Architecture

```text
Users (Browser)
        |
        v
Frontend (HTML/CSS/JavaScript)
        |
        v
Express.js Backend Server
        |
        +----------------------+
        |                      |
        v                      v
Authentication Routes     User/Admin Routes
        |                      |
        +----------+-----------+
                   |
                   v
          JSON File Storage
              (users.json)

GitHub Repository
        |
        v
Jenkins Pipeline
        |
        v
Docker Container
        |
        v
Ansible Deployment
```

---

## 📁 Repository Structure

```text
Team-2/
├── .dockerignore
├── .env.example
├── .git/
├── .gitignore
├── backend/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   └── server.js
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docker-compose.yml
├── Dockerfile
├── frontend/
│   ├── assets/
│   ├── pages/
│   ├── public/
│   ├── src/
│   └── styles/
├── index.js
├── package-lock.json
├── package.json
├── README.md
└── Team-2/  (empty)
```

---

## ⚙️ Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Team-2
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start the Application

From the backend folder:

```bash
npm start
```

Or from the project root:

```bash
npm start
```

### 4. Access the Application

Open your browser and navigate to:

```text
http://localhost:3000/pages/login.html
```

### 5. Use the New Features

* Open the Dashboard and select the Calorie Tracker card to visit the new calorie page.
* Use Daily Habits to set a daily calorie goal, save it, and review your progress.
* Use the BMI calculator and recommended intake helper on the calorie tracker page.
* Log meals to update your daily food calories and see them reflected in the daily progress summary.

---

## 👤 Demo Accounts

### Admin Login

```text
Username: admin
Password: admin
```

### Student Accounts

Students must register using the following email format:

```text
25000000@myrp.edu.sg
```

---

## 🐳 Docker Setup

Build and run the application using Docker Compose:

```bash
docker compose up --build
```

Access the application at:

```text
http://localhost:3000/pages/login.html
```

The Docker Compose configuration mounts `backend/data` to ensure JSON data persists outside the container.

---

## 🔄 CI/CD Workflow

The project uses Jenkins for continuous integration and deployment.

### Pipeline Activities

* Pull latest source code from GitHub
* Install dependencies
* Run automated tests
* Build Docker image
* Deploy application container

### Running Tests

Inside the `backend` directory:

```bash
npm test
```

---

## 🔌 Backend API Overview

### Authentication API

#### Register User

```http
POST /signup
```

* Validates RP email (`@myrp.edu.sg`)
* Validates password length (minimum 6 characters)
* Prevents duplicate registrations

#### Login

```http
POST /login
```

* Authenticates users
* Creates session cookies
* Updates user's last login

#### Session Check

```http
GET /session
```

Returns current login status.

#### Logout

```http
POST /logout
```

Destroys active session.

---

### User API

#### Get Current User

```http
GET /me
```

Returns:

* User profile
* Food logs
* Calorie information

---

### Admin API

#### List Users

```http
GET /admin/users
```

Returns all registered users.

#### Delete User

```http
DELETE /admin/users/:email
```

Deletes a specific user.

#### User Overview

```http
POST /admin/overview
```

Returns:

* Total food entries
* Total calories consumed

---

## 🌐 Frontend Overview

The frontend communicates with the backend using JavaScript Fetch API.

### Key Behaviours

* Uses `apiFetch()` wrapper for API calls.
* Automatically sends session cookies.
* Displays backend validation errors.
* Stores habit checklist progress in browser `localStorage`.

---

## ⚠️ Known Limitations

Current implementation limitations include:

* Passwords are stored in plaintext (bcrypt should be implemented).
* Admin endpoints currently lack server-side authorization.
* Habit checklist data is stored only in browser localStorage.
* No database integration (JSON storage used for simplicity).

Future improvements could include:

* Password hashing with bcrypt
* Role-based access control
* MySQL or MongoDB integration
* Server-side habit synchronization
* Enhanced analytics dashboard

---

## 👥 Team Workflow

* Create feature branches for all new work.
* Do not commit directly to `main`.
* Submit Pull Requests for review.
* Ensure all tests pass before merging.

Example workflow:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

## 📜 License

This project is developed for academic purposes as part of Republic Polytechnic's DevOps coursework.
