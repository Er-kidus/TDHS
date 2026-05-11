package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/inpatient-service/internal/handler"
	"github.com/tenadam/inpatient-service/internal/repository"
	"github.com/tenadam/inpatient-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /inpatients", h.CreateInpatient)
	mux.HandleFunc("GET /inpatients", h.ListInpatients)
	mux.HandleFunc("GET /inpatients/{id}", h.GetInpatient)
	mux.HandleFunc("PUT /inpatients/{id}", h.UpdateInpatient)
	mux.HandleFunc("DELETE /inpatients/{id}", h.DeleteInpatient)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"inpatient-service"}`))
	})
	return mux
}
