package models

import "time"

type JobStatus string

const (
	Pending   JobStatus = "pending"
	Running   JobStatus = "running"
	Completed JobStatus = "completed"
	Failed    JobStatus = "failed"
)

type Job struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`
	Payload    string    `json:"payload"`
	Status     JobStatus `json:"status"`
	WorkerID   string    `json:"workerId,omitempty"`
	Error      string    `json:"error,omitempty"`
	RetryCount int       `json:"retryCount"`
	MaxRetries int       `json:"maxRetries"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
