Distributed Task Queue
A distributed background job processing system built with Go, Redis, PostgreSQL, and React. It accepts jobs through an API, places them in a Redis queue, and processes them using multiple workers. PostgreSQL stores job records so job status and processing history can be monitored through a web dashboard.
Live Deployment
- Frontend Dashboard: https://distributed-task-queue-1-g5f2.onrender.com
Features
- Distributed job processing: Multiple workers process queued jobs.
- Redis queue: Redis stores jobs waiting to be processed.
- PostgreSQL persistence: Job details and status are stored in PostgreSQL.
- Automatic retries: Failed jobs can be retried up to their configured retry limit.
- Job status tracking: Track pending, running, completed, and failed jobs.
- Worker monitoring: View worker activity and the jobs assigned to each worker.
- System health monitoring: Check API, Redis, and PostgreSQL connectivity.
- Dashboard UI: View job statistics, jobs, workers, and system status in a React interface.
- Cloud deployment: Backend and frontend can be deployed separately.
Tech Stack
Area	Technology
Backend	Go (Golang), net/http
Queue	Redis
Database	PostgreSQL (Neon)
Frontend	React, Vite, Tailwind CSS
API communication	HTTP / JSON
Deployment	Render
Version control	Git and GitHub


Architecture
                 ┌──────────────────────┐
                 │   React Dashboard    │
                 └──────────┬───────────┘
                            │ HTTP / JSON
                            ▼
                 ┌──────────────────────┐
                 │      Go REST API     │
                 └───────┬────────┬─────┘
                         │        │
                enqueue job       │ persist/update
                         ▼        ▼
                 ┌────────────┐  ┌────────────────┐
                 │   Redis    │  │  PostgreSQL    │
                 │ Job Queue  │  │ Job Records    │
                 └─────┬──────┘  └────────────────┘
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
          Worker 1  Worker 2  Workers 3–4
              │
              ▼
       Process job and update status
How It Works
1. A job is submitted to the Go backend.
2. The backend stores the job record in PostgreSQL.
3. The job is added to the Redis queue.
4. One of the available workers retrieves the job and processes it.
5. The worker updates the job status and retry information in PostgreSQL.
6. The dashboard requests job data from the API and displays job and worker activity.
7. On startup, the backend can recover pending jobs recorded in the database and place them back into the queue.
Dashboard Pages
- Dashboard: Overview of job counts and activity.
- Jobs: View submitted jobs and their current statuses.
- Workers: Monitor worker assignments and recorded job activity.
- System Status: Check the health of the API, Redis, and PostgreSQL.
API
The deployed backend base URL is:
https://distributed-task-queue-048i.onrender.com
Method	Endpoint	Purpose
GET	/api/health	Check API and dependency health
GET	/api/jobs	Retrieve job records


The exact job-creation endpoint and request schema depend on the routes configured in the backend.
Health Check Example
Open this URL in a browser:
https://distributed-task-queue-048i.onrender.com/api/health
A healthy response has this structure:
{
  "services": {
    "api": "online",
    "postgresql": "online",
    "redis": "online"
  },
  "status": "online"
}
Run Locally
Prerequisites
Install the following:
- Go
- Node.js and npm
- Redis
- PostgreSQL
You also need a Redis instance and a PostgreSQL database. A hosted Redis service and Neon PostgreSQL can be used instead of running them locally.
1. Clone the repository
git clone https://github.com/KrishikaSinha/distributed-task-queue.git
cd distributed-task-queue
2. Configure environment variables
Create a .env file in the project root and configure the values expected by the backend:
REDIS_URL=your_redis_connection_url
DATABASE_URL=your_postgresql_connection_url
Use the actual connection URLs from your providers. Never commit .env or publish database credentials. The deployed Render service should have these values configured in its Environment settings.
3. Start the backend
Open a terminal in the backend directory:
cd backend
go mod download
go run .
If your local project uses a different backend entry-point path, run the command from the directory containing main.go. The backend listens on port 8080 by default.
4. Start the frontend
Open a second terminal from the repository root:
cd frontend
npm install
npm run dev
Vite will print the local frontend URL in the terminal. Ensure the frontend API URL points to your local backend (http://localhost:8080) when developing locally, or to the deployed backend when using the live deployment.
Deployment Notes
- Deploy the Go backend as a Render Web Service.
- Configure REDIS_URL and DATABASE_URL in the backend service's Environment settings.
- Deploy the React/Vite frontend as a Render Static Site.
- Set the frontend's API URL to the deployed backend URL.
- Do not upload secrets or .env files to GitHub.
Project Structure
distributed-task-queue/
├── backend/
│   ├── config/
│   ├── database/
│   ├── handlers/
│   ├── models/
│   ├── queue/
│   ├── redis/
│   ├── routes/
│   └── main.go
├── frontend/
│   └── src/
│       └── pages/
├── .gitignore
└── README.md
This is a high-level overview; exact filenames may differ as the project evolves.
Future Improvements
- Add authentication and role-based access to the dashboard.
- Add structured logs and job execution metrics.
- Add configurable scheduling and job priorities.
- Add automated tests and CI checks.
Author
Krishika Sinha

GitHub: KrishikaSinha
If you find this project useful, feel free to star the repository.