package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/queue-service/internal/handler"
	"github.com/tenadam/queue-service/internal/repository"
	"github.com/tenadam/queue-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /queues", h.CreateQueue)
	mux.HandleFunc("GET /queues", h.ListQueues)
	mux.HandleFunc("GET /queues/{id}", h.GetQueue)
	mux.HandleFunc("PUT /queues/{id}", h.UpdateQueue)
	mux.HandleFunc("DELETE /queues/{id}", h.DeleteQueue)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"queue-service"}`))
	})
	return mux
}
