package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/tenadam/user-service/api"
	_ "github.com/lib/pq" // Required to register the postgres driver
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Register the postgres driver
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	// Ensure DB is reachable
	if err := db.Ping(); err != nil {
		log.Fatalf("could not ping the database: %v", err)
	}
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}

	router := api.NewRouter(db)
	log.Printf("user-service listening on %s", port)
	log.Fatal(http.ListenAndServe(port, router))
}