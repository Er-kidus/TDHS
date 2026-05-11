package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/medication-administration-service/internal/handler"
	"github.com/tenadam/medication-administration-service/internal/repository"
	"github.com/tenadam/medication-administration-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /medication-administrations", h.CreateMedicationAdministration)
	mux.HandleFunc("GET /medication-administrations", h.ListMedicationAdministrations)
	mux.HandleFunc("GET /medication-administrations/{id}", h.GetMedicationAdministration)
	mux.HandleFunc("PUT /medication-administrations/{id}", h.UpdateMedicationAdministration)
	mux.HandleFunc("DELETE /medication-administrations/{id}", h.DeleteMedicationAdministration)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"medication-administration-service"}`))
	})
	return mux
}
