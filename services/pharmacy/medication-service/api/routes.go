package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/medication-service/internal/handler"
	"github.com/tenadam/medication-service/internal/repository"
	"github.com/tenadam/medication-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /medications", h.CreateMedication)
	mux.HandleFunc("GET /medications", h.ListMedications)
	mux.HandleFunc("GET /medications/{id}", h.GetMedication)
	mux.HandleFunc("PUT /medications/{id}", h.UpdateMedication)
	mux.HandleFunc("DELETE /medications/{id}", h.DeleteMedication)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"medication-service"}`))
	})
	return mux
}
