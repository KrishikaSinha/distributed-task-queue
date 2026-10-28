package handlers

import (
	"encoding/json"
	"net/http"

	"distributed-task-queue/queue"
)

type WorkerHandler struct {
	Queue *queue.Queue
}

func NewWorkerHandler(q *queue.Queue) *WorkerHandler {
	return &WorkerHandler{
		Queue: q,
	}
}

func (h *WorkerHandler) GetWorkerStatus(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"totalWorkers": 4,
		"status":       "running",
		"message":      "Workers are processing jobs",
	}

	json.NewEncoder(w).Encode(response)
}
