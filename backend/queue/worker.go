package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"distributed-task-queue/database"
	"distributed-task-queue/models"
	"distributed-task-queue/redis"
)

type Worker struct {
	ID    string
	Queue *Queue
}

func NewWorker(id string, q *Queue) *Worker {
	return &Worker{
		ID:    id,
		Queue: q,
	}
}

func (w *Worker) Start() {
	go func() {
		fmt.Printf(
			"[%s] Worker started and waiting for jobs...\n",
			w.ID,
		)

		for {
			ctx := context.Background()

			result, err := redis.Client.BRPop(
				ctx,
				0,
				QueueName,
			).Result()

			if err != nil {
				fmt.Printf("[%s] Redis error: %v\n", w.ID, err)
				time.Sleep(2 * time.Second)
				continue
			}

			var job models.Job

			if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
				fmt.Printf("[%s] Failed to decode job: %v\n", w.ID, err)
				continue
			}

			w.process(&job)
		}
	}()
}

func (w *Worker) process(job *models.Job) {

	w.Queue.Mu.Lock()
	job.Status = models.Running
	job.WorkerID = w.ID
	job.Error = ""
	job.UpdatedAt = time.Now()
	w.Queue.Store[job.ID] = job
	w.Queue.Mu.Unlock()

	if err := database.UpdateJob(job); err != nil {
		fmt.Printf(
			"[%s] Failed to save running status: %v\n",
			w.ID,
			err,
		)
	}

	fmt.Printf(
		"[%s] Processing Job %s (%s), attempt %d/%d\n",
		w.ID,
		job.ID,
		job.Type,
		job.RetryCount+1,
		job.MaxRetries+1,
	)

	time.Sleep(time.Duration(2+rand.Intn(4)) * time.Second)

	if strings.HasPrefix(job.Type, "fail-") {
		w.handleFailure(
			job,
			fmt.Sprintf(
				"Simulated processing failure for job type: %s",
				job.Type,
			),
		)
		return
	}

	if strings.HasPrefix(job.Type, "retry-once-") &&
		job.RetryCount == 0 {

		w.handleFailure(
			job,
			fmt.Sprintf(
				"Temporary failure on first attempt for job type: %s",
				job.Type,
			),
		)
		return
	}

	w.Queue.Mu.Lock()
	job.Status = models.Completed
	job.Error = ""
	job.UpdatedAt = time.Now()
	w.Queue.Store[job.ID] = job
	w.Queue.Mu.Unlock()

	if err := database.UpdateJob(job); err != nil {
		fmt.Printf(
			"[%s] Failed to save completed status: %v\n",
			w.ID,
			err,
		)
		return
	}

	fmt.Printf(
		"[%s] Completed Job %s\n",
		w.ID,
		job.ID,
	)
}

func (w *Worker) handleFailure(job *models.Job, reason string) {
	maxRetries := job.MaxRetries
	if maxRetries < 0 {
		maxRetries = 0
	}

	if job.RetryCount < maxRetries {

		job.RetryCount++
		job.Status = models.Pending
		job.Error = reason
		job.UpdatedAt = time.Now()

		w.Queue.Mu.Lock()
		w.Queue.Store[job.ID] = job
		w.Queue.Mu.Unlock()

		if err := database.UpdateJob(job); err != nil {
			fmt.Printf(
				"[%s] Failed to save retry state for Job %s: %v\n",
				w.ID,
				job.ID,
				err,
			)
			w.markFailed(
				job,
				"Could not save retry state: "+err.Error(),
			)
			return
		}

		time.Sleep(time.Second)

		jobData, err := json.Marshal(job)
		if err != nil {
			w.markFailed(
				job,
				"Could not encode retry job: "+err.Error(),
			)
			return
		}

		if err := redis.Client.LPush(
			context.Background(),
			QueueName,
			jobData,
		).Err(); err != nil {
			w.markFailed(
				job,
				"Could not requeue job: "+err.Error(),
			)
			return
		}

		fmt.Printf(
			"[%s] Retry queued for Job %s (%d/%d)\n",
			w.ID,
			job.ID,
			job.RetryCount,
			maxRetries,
		)
		return
	}

	w.markFailed(job, reason)
}

func (w *Worker) markFailed(job *models.Job, reason string) {
	w.Queue.Mu.Lock()
	job.Status = models.Failed
	job.Error = reason
	job.UpdatedAt = time.Now()
	w.Queue.Store[job.ID] = job
	w.Queue.Mu.Unlock()

	if err := database.UpdateJob(job); err != nil {
		fmt.Printf(
			"[%s] Failed to persist failure for Job %s: %v\n",
			w.ID,
			job.ID,
			err,
		)
		return
	}

	fmt.Printf(
		"[%s] Failed Job %s: %s\n",
		w.ID,
		job.ID,
		reason,
	)
}
