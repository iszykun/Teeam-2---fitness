# Nutrition Tracker

A simple nutrition-focused web app for logging food entries and tracking daily macros. Users can add meals with calories, protein, carbs, and fat, then review daily totals, set macro goals, and watch their progress update instantly.

## Features

- Add food entries with name, calories, protein, carbs, fat, and date
- Review daily totals for calories, protein, carbs, and fat
- Set daily macro goals and see progress with clear progress bars
- Save nutrition data locally so it stays available after refresh

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open the app at:
   ```text
   http://localhost:3000/
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
