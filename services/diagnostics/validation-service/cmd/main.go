package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/tenadam/validation-service/api"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	// Register your preferred SQL driver (e.g. github.com/lib/pq) before calling sql.Open.
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}

	router := api.NewRouter(db)
	log.Printf("validation-service listening on %s", port)
	log.Fatal(http.ListenAndServe(port, router))
}
