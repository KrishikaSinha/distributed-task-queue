package redis

import (
	"context"
	"fmt"
	"os"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

var Client *goredis.Client

func Connect() error {
	redisURL := os.Getenv("REDIS_URL")

	if redisURL == "" {
		return fmt.Errorf("REDIS_URL is not set")
	}

	options, err := goredis.ParseURL(redisURL)
	if err != nil {
		return fmt.Errorf("invalid Redis URL: %w", err)
	}

	Client = goredis.NewClient(options)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	if err := Client.Ping(ctx).Err(); err != nil {
		_ = Client.Close()
		Client = nil
		return fmt.Errorf("Redis connection failed: %w", err)
	}

	fmt.Println("Redis: Connected successfully")
	return nil
}

func HealthCheck(ctx context.Context) error {
	if Client == nil {
		return fmt.Errorf("Redis client is not initialized")
	}

	if err := Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("Redis health check failed: %w", err)
	}

	return nil
}

func Close() error {
	if Client == nil {
		return nil
	}

	err := Client.Close()
	Client = nil
	return err
}
