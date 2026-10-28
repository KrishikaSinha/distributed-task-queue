package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect() error {
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL is not set")
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("invalid database configuration: %w", err)
	}

	config.MaxConns = 5

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	DB, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("database connection failed: %w", err)
	}

	if err := DB.Ping(ctx); err != nil {
		DB.Close()
		DB = nil
		return fmt.Errorf("database ping failed: %w", err)
	}

	fmt.Println("PostgreSQL: Connected successfully")
	return nil
}

func HealthCheck(ctx context.Context) error {
	if DB == nil {
		return fmt.Errorf("PostgreSQL database is not connected")
	}

	if err := DB.Ping(ctx); err != nil {
		return fmt.Errorf("PostgreSQL health check failed: %w", err)
	}

	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
		DB = nil
	}
}
