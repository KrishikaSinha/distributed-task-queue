package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"distributed-task-queue/database"
	"distributed-task-queue/queue"
	"distributed-task-queue/redis"
	"distributed-task-queue/routes"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found at ../.env; using environment variables")
	}

	if err := redis.Connect(); err != nil {
		log.Fatal("Redis connection error: ", err)
	}
	defer func() {
		if err := redis.Close(); err != nil {
			log.Println("Redis close error:", err)
		}
	}()

	if err := database.Connect(); err != nil {
		log.Fatal("PostgreSQL connection error: ", err)
	}
	defer database.Close()

	jobQueue := queue.NewQueue(100)

	pendingJobs, err := database.GetPendingJobs()
	if err != nil {
		log.Fatal("Failed to retrieve pending jobs: ", err)
	}

	recovered, err := jobQueue.RecoverPendingJobs(pendingJobs)
	if err != nil {
		log.Fatal("Failed to recover pending jobs: ", err)
	}

	fmt.Printf("Pending jobs found in database: %d\n", len(pendingJobs))
	fmt.Printf("Jobs recovered into Redis: %d\n", recovered)

	for i := 1; i <= 4; i++ {
		worker := queue.NewWorker(
			fmt.Sprintf("worker-%d", i),
			jobQueue,
		)
		worker.Start()
	}

	router := routes.SetupRoutes(jobQueue)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("===================================")
	fmt.Println(" Distributed Task Queue")
	fmt.Println(" Port:", port)
	fmt.Println(" Workers: 4")
	fmt.Println(" Redis: Connected")
	fmt.Println(" PostgreSQL: Connected")
	fmt.Println("===================================")

	log.Fatal(http.ListenAndServe(":"+port, router))
}
