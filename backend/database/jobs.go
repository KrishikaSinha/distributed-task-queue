package database

import (
	"context"
	"fmt"
	"time"

	"distributed-task-queue/models"
)

func SaveJob(job *models.Job) error {
	if DB == nil {
		return fmt.Errorf("PostgreSQL database is not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := DB.Exec(ctx, `
		INSERT INTO jobs (
			id, type, payload, status, worker_id,
			error, retry_count, max_retries,
			created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`,
		job.ID,
		job.Type,
		job.Payload,
		string(job.Status),
		nullableString(job.WorkerID),
		nullableString(job.Error),
		job.RetryCount,
		job.MaxRetries,
		job.CreatedAt,
		job.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to save job: %w", err)
	}

	return nil
}

func UpdateJob(job *models.Job) error {
	if DB == nil {
		return fmt.Errorf("PostgreSQL database is not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := DB.Exec(ctx, `
		UPDATE jobs
		SET status = $1,
		    worker_id = $2,
		    error = $3,
		    retry_count = $4,
		    max_retries = $5,
		    updated_at = $6
		WHERE id = $7
	`,
		string(job.Status),
		nullableString(job.WorkerID),
		nullableString(job.Error),
		job.RetryCount,
		job.MaxRetries,
		job.UpdatedAt,
		job.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update job: %w", err)
	}

	return nil
}

func GetAllJobs() ([]*models.Job, error) {
	if DB == nil {
		return nil, fmt.Errorf("PostgreSQL database is not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := DB.Query(ctx, `
		SELECT id, type, payload, status,
		       worker_id, error, retry_count, max_retries,
		       created_at, updated_at
		FROM jobs
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve jobs: %w", err)
	}
	defer rows.Close()

	jobs := make([]*models.Job, 0)

	for rows.Next() {
		job := &models.Job{}
		var status string
		var workerID, jobError *string

		err := rows.Scan(
			&job.ID,
			&job.Type,
			&job.Payload,
			&status,
			&workerID,
			&jobError,
			&job.RetryCount,
			&job.MaxRetries,
			&job.CreatedAt,
			&job.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan job: %w", err)
		}

		job.Status = models.JobStatus(status)

		if workerID != nil {
			job.WorkerID = *workerID
		}
		if jobError != nil {
			job.Error = *jobError
		}

		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading jobs: %w", err)
	}

	return jobs, nil
}

func GetPendingJobs() ([]*models.Job, error) {
	if DB == nil {
		return nil, fmt.Errorf("PostgreSQL database is not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := DB.Query(ctx, `
		SELECT id, type, payload, status,
		       worker_id, error, retry_count, max_retries,
		       created_at, updated_at
		FROM jobs
		WHERE status = $1
		ORDER BY created_at ASC
	`, string(models.Pending))
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve pending jobs: %w", err)
	}
	defer rows.Close()

	jobs := make([]*models.Job, 0)

	for rows.Next() {
		job := &models.Job{}
		var status string
		var workerID, jobError *string

		err := rows.Scan(
			&job.ID,
			&job.Type,
			&job.Payload,
			&status,
			&workerID,
			&jobError,
			&job.RetryCount,
			&job.MaxRetries,
			&job.CreatedAt,
			&job.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pending job: %w", err)
		}

		job.Status = models.JobStatus(status)

		if workerID != nil {
			job.WorkerID = *workerID
		}
		if jobError != nil {
			job.Error = *jobError
		}

		jobs = append(jobs, job)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading pending jobs: %w", err)
	}

	return jobs, nil
}

func GetJobByID(id string) (*models.Job, error) {
	if DB == nil {
		return nil, fmt.Errorf("PostgreSQL database is not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	job := &models.Job{}
	var status string
	var workerID, jobError *string

	err := DB.QueryRow(ctx, `
		SELECT id, type, payload, status,
		       worker_id, error, retry_count, max_retries,
		       created_at, updated_at
		FROM jobs
		WHERE id = $1
	`, id).Scan(
		&job.ID,
		&job.Type,
		&job.Payload,
		&status,
		&workerID,
		&jobError,
		&job.RetryCount,
		&job.MaxRetries,
		&job.CreatedAt,
		&job.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to retrieve job: %w", err)
	}

	job.Status = models.JobStatus(status)

	if workerID != nil {
		job.WorkerID = *workerID
	}
	if jobError != nil {
		job.Error = *jobError
	}

	return job, nil
}

func nullableString(value string) interface{} {
	if value == "" {
		return nil
	}
	return value
}
