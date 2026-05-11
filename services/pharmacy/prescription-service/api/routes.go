package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/prescription-service/internal/handler"
	"github.com/tenadam/prescription-service/internal/repository"
	"github.com/tenadam/prescription-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /prescriptions", h.CreatePrescription)
	mux.HandleFunc("GET /prescriptions", h.ListPrescriptions)
	mux.HandleFunc("GET /prescriptions/{id}", h.GetPrescription)
	mux.HandleFunc("PUT /prescriptions/{id}", h.UpdatePrescription)
	mux.HandleFunc("DELETE /prescriptions/{id}", h.DeletePrescription)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"prescription-service"}`))
	})
	return mux
}
