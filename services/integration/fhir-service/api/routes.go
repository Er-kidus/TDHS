package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/fhir-service/internal/handler"
	"github.com/tenadam/fhir-service/internal/repository"
	"github.com/tenadam/fhir-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /fhirs", h.CreateFhir)
	mux.HandleFunc("GET /fhirs", h.ListFhirs)
	mux.HandleFunc("GET /fhirs/{id}", h.GetFhir)
	mux.HandleFunc("PUT /fhirs/{id}", h.UpdateFhir)
	mux.HandleFunc("DELETE /fhirs/{id}", h.DeleteFhir)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"fhir-service"}`))
	})
	return mux
}
