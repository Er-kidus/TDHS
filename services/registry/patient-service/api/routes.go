package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/patient-service/internal/handler"
	"github.com/tenadam/patient-service/internal/repository"
	"github.com/tenadam/patient-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /patients", h.CreatePatient)
	mux.HandleFunc("GET /patients", h.ListPatients)
	mux.HandleFunc("GET /patients/{id}", h.GetPatient)
	mux.HandleFunc("PUT /patients/{id}", h.UpdatePatient)
	mux.HandleFunc("DELETE /patients/{id}", h.DeletePatient)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"patient-service"}`))
	})
	return mux
}
