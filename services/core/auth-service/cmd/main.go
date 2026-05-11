package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/tenadam/auth-service/api"
	_ "github.com/lib/pq" // Required to register the postgres driver
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// The "_" import above allows this "postgres" driver to be recognized
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	
	// Check if the connection is actually alive
	if err := db.Ping(); err != nil {
		log.Fatalf("could not ping the database: %v", err)
	}
	
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}

	router := api.NewRouter(db)
	
	log.Printf("auth-service listening on %s", port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}