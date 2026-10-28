package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"distributed-task-queue/models"
	"distributed-task-queue/redis"
)

const QueueName = "task_queue"

type Queue struct {
	Store map[string]*models.Job
	Mu    sync.RWMutex
}

func NewQueue(buffer int) *Queue {
	return &Queue{
		Store: make(map[string]*models.Job),
	}
}

func (q *Queue) Add(job *models.Job) error {
	data, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to encode job: %w", err)
	}

	ctx := context.Background()

	if redis.Client == nil {
		return fmt.Errorf("Redis client is not initialized")
	}

	if err := redis.Client.RPush(ctx, QueueName, data).Err(); err != nil {
		return fmt.Errorf("failed to add job to Redis: %w", err)
	}

	q.Mu.Lock()
	q.Store[job.ID] = job
	q.Mu.Unlock()

	return nil
}

func (q *Queue) RecoverPendingJobs(jobs []*models.Job) (int, error) {
	if redis.Client == nil {
		return 0, fmt.Errorf("Redis client is not initialized")
	}

	ctx := context.Background()

	queuedData, err := redis.Client.LRange(
		ctx,
		QueueName,
		0,
		-1,
	).Result()

	if err != nil {
		return 0, fmt.Errorf("failed to inspect Redis queue: %w", err)
	}

	queuedIDs := make(map[string]bool)

	for _, data := range queuedData {
		var queuedJob models.Job

		if err := json.Unmarshal([]byte(data), &queuedJob); err != nil {
			return 0, fmt.Errorf("failed to decode queued job: %w", err)
		}

		queuedIDs[queuedJob.ID] = true
	}

	recovered := 0

	for _, job := range jobs {
		if job == nil || job.Status != models.Pending {
			continue
		}

		q.Mu.Lock()
		q.Store[job.ID] = job
		q.Mu.Unlock()

		if queuedIDs[job.ID] {
			continue
		}

		if err := q.Add(job); err != nil {
			return recovered, fmt.Errorf(
				"failed to recover job %s: %w",
				job.ID,
				err,
			)
		}

		queuedIDs[job.ID] = true
		recovered++
	}

	return recovered, nil
}

func (q *Queue) Get(id string) (*models.Job, bool) {
	q.Mu.RLock()
	defer q.Mu.RUnlock()

	job, exists := q.Store[id]
	return job, exists
}

func (q *Queue) GetAll() []*models.Job {
	q.Mu.RLock()
	defer q.Mu.RUnlock()

	result := make([]*models.Job, 0, len(q.Store))

	for _, job := range q.Store {
		result = append(result, job)
	}

	return result
}
