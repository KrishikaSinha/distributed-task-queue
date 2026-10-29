# 🚀 Distributed Task Queue

### A Distributed Background Job Processing System Built with Go

A full-stack project that processes background jobs using **Go, Redis, and PostgreSQL**, with a modern React dashboard to monitor jobs, workers, and system health.

<p align="center">
  <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
</p>

---

## ✨ Overview

Distributed Task Queue is designed to handle background tasks asynchronously. Jobs are queued through Redis, processed by multiple workers, and tracked in PostgreSQL.

The project demonstrates backend engineering concepts such as job queues, concurrent processing, database persistence, retries, and service monitoring.

## 🔥 Key Features

- ⚡ **Asynchronous Job Processing** — Process background tasks outside the main API request.
- 🔄 **Redis Queue** — Queue jobs for worker processing.
- 👷 **Multiple Workers** — Run multiple workers to process available jobs.
- 🗄️ **PostgreSQL Storage** — Persist job records and processing statuses.
- 🔁 **Retry Mechanism** — Retry failed jobs according to the configured retry limit.
- 📊 **Live Dashboard** — Monitor job statistics and system activity.
- 📋 **Job Management** — Track pending, running, completed, and failed jobs.
- 🖥️ **Worker Monitoring** — View worker assignments and recorded activity.
- 💚 **System Health Checks** — Check API, Redis, and PostgreSQL connectivity.
- ☁️ **Cloud Deployment** — Deploy the backend and frontend separately.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Go (Golang) | Backend and worker processing |
| Redis | Job queue |
| PostgreSQL | Persistent job records |
| Neon | Hosted PostgreSQL database |
| React.js | Frontend dashboard |
| Vite | Frontend development and build tool |
| Tailwind CSS | UI styling |
| REST API | Frontend-backend communication |
| Render | Application deployment |
| Git & GitHub | Version control |

## 🏗️ Architecture

```text
              ┌──────────────────────┐
              │   React Dashboard    │
              └──────────┬───────────┘
                         │ HTTP / JSON
                         ▼
              ┌──────────────────────┐
              │      Go REST API     │
              └──────────┬───────────┘
                         │
                 ┌───────┴────────┐
                 ▼                ▼
          ┌────────────┐   ┌────────────┐
          │   Redis    │   │ PostgreSQL │
          │ Job Queue  │   │ Job Records│
          └─────┬──────┘   └──────▲─────┘
                │                 │
                ▼                 │
          ┌────────────┐           │
          │ Go Workers │───────────┘
          └────────────┘
             Process Jobs
```

## ⚙️ How It Works

1. A job is submitted to the backend API.
2. The backend stores job information in PostgreSQL.
3. The job is added to the Redis queue.
4. An available worker retrieves and processes the job.
5. The job status is updated as processing progresses.
6. Failed jobs can be retried according to the configured retry policy.
7. The dashboard fetches job data and displays worker activity and system status.

## 🖥️ Dashboard Pages

| Page | Functionality |
|---|---|
| 📊 Dashboard | Summary of job statistics |
| 📋 Jobs | View job records and statuses |
| 👷 Workers | Monitor worker activity and assignments |
| 💚 System Status | Check API, Redis, and PostgreSQL health |

## 🌐 Live Deployment

https://distributed-task-queue-1-g5f2.onrender.com

Expected healthy response:

```json
{
  "services": {
    "api": "online",
    "postgresql": "online",
    "redis": "online"
  },
  "status": "online"
}
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API and dependency health |
| `GET` | `/api/jobs` | Retrieve job records |

Additional endpoints depend on the routes implemented in the backend.

## 💻 Run Locally

### Prerequisites

- Go
- Node.js and npm
- Redis instance
- PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/KrishikaSinha/distributed-task-queue.git
cd distributed-task-queue
```

### 2. Configure environment variables

Create a `.env` file in the project root with your database connection settings:

```env
REDIS_URL=your_redis_connection_url
DATABASE_URL=your_postgresql_connection_url
```

Replace the placeholders with your actual connection URLs. Never upload credentials or `.env` files to GitHub.

### 3. Start the backend

```bash
cd backend
go mod download
go run .
```

The backend uses port `8080` by default.

### 4. Start the frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. Make sure the frontend API configuration points to your local backend or the deployed backend, as appropriate.

## ☁️ Deployment

The application uses the following services:

- **Backend:** Render Web Service
- **Frontend:** Render Static Site
- **Database:** Neon PostgreSQL
- **Queue:** Redis

Configure the required environment variables in the backend hosting service. Keep credentials private and configure the frontend API URL correctly.

## 📚 Key Learnings

- Building REST APIs with Go
- Managing asynchronous jobs with Redis
- Persisting job records in PostgreSQL
- Coordinating multiple background workers
- Implementing job status tracking and retries
- Integrating React with a backend API
- Deploying a full-stack application
- Using Git and GitHub for version control

## 🚀 Future Improvements

- Job priorities and scheduled execution
- Authentication and role-based access
- Structured logging and monitoring
- Automated testing
- CI/CD integration

## 👩‍💻 Author

**Krishika Sinha**

---

<p align="center">
  <b>Built with Go, Redis, PostgreSQL, and React ❤️</b>
</p>
