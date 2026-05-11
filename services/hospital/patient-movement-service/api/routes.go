package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/patient-movement-service/internal/handler"
	"github.com/tenadam/patient-movement-service/internal/repository"
	"github.com/tenadam/patient-movement-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /patient-movements", h.CreatePatientMovement)
	mux.HandleFunc("GET /patient-movements", h.ListPatientMovements)
	mux.HandleFunc("GET /patient-movements/{id}", h.GetPatientMovement)
	mux.HandleFunc("PUT /patient-movements/{id}", h.UpdatePatientMovement)
	mux.HandleFunc("DELETE /patient-movements/{id}", h.DeletePatientMovement)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"patient-movement-service"}`))
	})
	return mux
}
