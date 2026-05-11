package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/scheduling-service/internal/handler"
	"github.com/tenadam/scheduling-service/internal/repository"
	"github.com/tenadam/scheduling-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /schedulings", h.CreateScheduling)
	mux.HandleFunc("GET /schedulings", h.ListSchedulings)
	mux.HandleFunc("GET /schedulings/{id}", h.GetScheduling)
	mux.HandleFunc("PUT /schedulings/{id}", h.UpdateScheduling)
	mux.HandleFunc("DELETE /schedulings/{id}", h.DeleteScheduling)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"scheduling-service"}`))
	})
	return mux
}
