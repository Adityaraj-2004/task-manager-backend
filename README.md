# Task Manager Backend

A Node.js / Express backend for a task manager application, built with MongoDB, JWT auth, and REST API endpoints for user authentication and task management.

## Features

- User registration and login with JWT authentication
- Create, read, update, delete tasks
- Toggle task completion
- Delete all completed tasks
- Task statistics endpoint
- Input validation using `express-validator`
- CORS support for a frontend client

## Tech stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `express-validator` for request validation
- `dotenv` for environment variables

## Getting started

### Prerequisites

- Node.js 18+ installed
- MongoDB connection string available

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Run the server

Start in development mode with nodemon:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The server runs on `http://localhost:5000` by default.

## API Endpoints

### Auth

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT
- `GET /api/auth/me` - Get current user details (requires auth token)

### Tasks (protected routes)

- `GET /api/tasks` - List tasks for the authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/completed` - Delete all completed tasks
- `GET /api/tasks/stats` - Get task statistics

## Notes

- All task routes require an `Authorization` header with a valid JWT:

```http
Authorization: Bearer <token>
```

- The backend uses CORS and is configured to allow requests from `CLIENT_URL`.

## License

This project is released under the MIT License.
