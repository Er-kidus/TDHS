package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/radiology-workflow-service/internal/handler"
	"github.com/tenadam/radiology-workflow-service/internal/repository"
	"github.com/tenadam/radiology-workflow-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /radiology-workflows", h.CreateRadiologyWorkflow)
	mux.HandleFunc("GET /radiology-workflows", h.ListRadiologyWorkflows)
	mux.HandleFunc("GET /radiology-workflows/{id}", h.GetRadiologyWorkflow)
	mux.HandleFunc("PUT /radiology-workflows/{id}", h.UpdateRadiologyWorkflow)
	mux.HandleFunc("DELETE /radiology-workflows/{id}", h.DeleteRadiologyWorkflow)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"radiology-workflow-service"}`))
	})
	return mux
}
