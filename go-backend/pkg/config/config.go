package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	JWTSecret  string
	RedisURL   string
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:password@localhost/pharmacy_db?sslmode=disable"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		RedisURL:   getEnv("REDIS_URL", "localhost:6379"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
