package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"distributed-task-queue/database"
	"distributed-task-queue/handlers"
	"distributed-task-queue/queue"
	"distributed-task-queue/redis"
)

func SetupRoutes(q *queue.Queue) http.Handler {
	jobHandler := handlers.NewJobHandler(q)

	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		redisStatus := "online"
		postgresStatus := "online"

		if err := redis.HealthCheck(ctx); err != nil {
			redisStatus = "offline"
		}

		if err := database.HealthCheck(ctx); err != nil {
			postgresStatus = "offline"
		}

		overallStatus := "online"
		httpStatus := http.StatusOK

		if redisStatus == "offline" || postgresStatus == "offline" {
			overallStatus = "degraded"
			httpStatus = http.StatusServiceUnavailable
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(httpStatus)

		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status": overallStatus,
			"services": map[string]string{
				"api":        "online",
				"redis":      redisStatus,
				"postgresql": postgresStatus,
			},
		})
	})

	mux.HandleFunc("/api/jobs", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		switch r.Method {
		case http.MethodPost:
			jobHandler.CreateJob(w, r)
		case http.MethodGet:
			jobHandler.GetJobs(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/jobs/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			jobHandler.GetJob(w, r)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Write([]byte(`{
			"message": "Distributed Task Queue API",
			"status": "running"
		}`))
	})

	return mux
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}
