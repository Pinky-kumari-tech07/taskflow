# TaskFlow — MERN Task Manager

TaskFlow is a simple and responsive task management application built using the MERN stack. It helps users create, organize, update, search, filter, and track their daily tasks.

## Features

* Create new tasks with a title, description, status, and due date.
* View all tasks in a dashboard.
* Edit existing tasks.
* Delete tasks.
* Mark tasks as completed or pending.
* Search tasks by title or description.
* Filter tasks by status.
* View task statistics for total, pending, in-progress, and completed tasks.
* Responsive dashboard design.

## Tech Stack

**Frontend:** React, Vite, Axios, CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB Atlas
**ODM:** Mongoose
**Version Control:** Git and GitHub

## Getting Started

### Prerequisites

* Node.js and npm
* MongoDB Atlas account or a MongoDB instance
* Git

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the example connection string with your own MongoDB connection string. Never publish database credentials.

Start the backend:

```bash
npm run dev
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:5173`.

## API Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/api/tasks`     | Retrieve all tasks  |
| GET    | `/api/tasks/:id` | Retrieve a task     |
| POST   | `/api/tasks`     | Create a task       |
| PUT    | `/api/tasks/:id` | Update a task       |
| DELETE | `/api/tasks/:id` | Delete a task       |
| GET    | `/api/health`    | Check server health |

## Testing

The following functionality has been manually tested:

* Create a task
* Edit a task
* Mark a task as completed
* Search and filter tasks
* Delete a task

## AI Assistance

Document the AI coding tool used during development, the tasks it helped with, and the changes you reviewed or tested yourself. Only list tools that you actually used, and describe their contribution accurately.

## Future Improvements

* User authentication
* Task priority levels
* Pagination and sorting
* Deployment and live demo

## Author

Pinky Kumari Saha
