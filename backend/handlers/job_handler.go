package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"distributed-task-queue/database"
	"distributed-task-queue/models"
	"distributed-task-queue/queue"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type JobHandler struct {
	Queue *queue.Queue
}

type CreateJobRequest struct {
	Type    string `json:"type"`
	Payload string `json:"payload"`
}

func NewJobHandler(q *queue.Queue) *JobHandler {
	return &JobHandler{Queue: q}
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var request CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	request.Type = strings.TrimSpace(request.Type)
	if request.Type == "" {
		http.Error(w, "Job type is required", http.StatusBadRequest)
		return
	}

	now := time.Now()

	job := &models.Job{
		ID:         uuid.New().String(),
		Type:       request.Type,
		Payload:    request.Payload,
		Status:     models.Pending,
		RetryCount: 0,
		MaxRetries: 3,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := database.SaveJob(job); err != nil {
		http.Error(
			w,
			"Failed to save job in database",
			http.StatusInternalServerError,
		)
		return
	}

	if err := h.Queue.Add(job); err != nil {
		job.Status = models.Failed
		job.Error = "Failed to add job to Redis queue"
		job.UpdatedAt = time.Now()

		if updateErr := database.UpdateJob(job); updateErr != nil {
			http.Error(
				w,
				"Queue failed and database status update failed",
				http.StatusInternalServerError,
			)
			return
		}

		http.Error(
			w,
			"Failed to queue job",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(job)
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	jobs, err := database.GetAllJobs()
	if err != nil {
		http.Error(
			w,
			"Failed to retrieve jobs from database",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(jobs)
}

func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/jobs/")
	if id == "" || strings.Contains(id, "/") {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	job, err := database.GetJobByID(id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Job not found", http.StatusNotFound)
			return
		}

		http.Error(
			w,
			"Failed to retrieve job from database",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(job)
}
