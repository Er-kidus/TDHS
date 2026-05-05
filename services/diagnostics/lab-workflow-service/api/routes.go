package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/lab-workflow-service/internal/handler"
	"github.com/tenadam/lab-workflow-service/internal/repository"
	"github.com/tenadam/lab-workflow-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /lab-workflows", h.CreateLabWorkflow)
	mux.HandleFunc("GET /lab-workflows", h.ListLabWorkflows)
	mux.HandleFunc("GET /lab-workflows/{id}", h.GetLabWorkflow)
	mux.HandleFunc("PUT /lab-workflows/{id}", h.UpdateLabWorkflow)
	mux.HandleFunc("DELETE /lab-workflows/{id}", h.DeleteLabWorkflow)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"lab-workflow-service"}`))
	})
	return mux
}
