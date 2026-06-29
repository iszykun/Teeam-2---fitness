# RP Fitness Full-Stack App

A C270 DevOps-ready fitness tracking application with a separated frontend, structured Express backend, JSON storage, and Docker support.

## Features

- RP student signup and login validation
- Session-based authentication
- Admin user management with overview and delete actions
- Calorie tracker with add, edit, delete, reset, BMI, and calorie need calculation
- Daily Calorie Goals page with personal goal setting and editing
- Monthly calendar view with green, red, and grey day statuses
- Green means the calorie goal was achieved
- Red means the calorie goal was exceeded
- Grey means no data or a future date
- Responsive black and green interface
- Clear API route structure for maintainability
- Docker Compose support for local deployment demos

## Project Structure

```text
frontend/
  public/
  src/
  pages/
    DailyGoals.html
  components/
  styles/
  assets/
backend/
  server.js
  routes/
  controllers/
  models/
  middleware/
  data/
docker/
  Dockerfile.backend
  Dockerfile.frontend
Dockerfile
docker-compose.yml
.env.example
.gitignore
README.md
```

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
npm start
```

Open:

```text
http://localhost:3000/pages/login.html
```

## Testing the Daily Calorie Goals feature

1. Login as a student.
2. Open the Dashboard and click `Daily Goals`.
3. Enter and save a daily calorie goal between `500` and `10000`.
4. Verify today's goal, calories consumed, and calories remaining appear.
5. Navigate the monthly calendar to see green, red, or grey dates.

Calorie goals and history persist using JSON storage in `backend/data/users.json`.

You can also run from the project root:

```bash
npm start
```

## Demo Accounts

Admin demo login:

```text
Username: admin
Password: admin
```

Student accounts must use this email format:

```text
25000000@myrp.edu.sg
```

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/calories/profile`
- `POST /api/calories`
- `PUT /api/calories/:id`
- `DELETE /api/calories/:id`
- `POST /api/calories/reset`
- `GET /api/goals`
- `POST /api/goals`
- `GET /api/goals/calendar`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:email`
- `POST /api/admin/users/overview`

Legacy routes such as `/login.html`, `/signup`, `/login`, `/get-profile`, `/add-food`, and `/get-users` are still supported for compatibility.

## Docker

Build and run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000/pages/login.html
```

The Compose file mounts `backend/data` so JSON data persists outside the container.

## CI/CD Notes

- Use `npm test` inside `backend/` for a basic Node syntax check.
- Store real deployment secrets using your CI/CD platform secrets, based on `.env.example`.
- Keep work in feature branches and use pull requests for GitHub collaboration evidence.
- JSON storage is intentionally simple for the assignment; the model layer can be replaced by a database later without rewriting routes or UI code.
