package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/triage-service/internal/handler"
	"github.com/tenadam/triage-service/internal/repository"
	"github.com/tenadam/triage-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /triages", h.CreateTriage)
	mux.HandleFunc("GET /triages", h.ListTriages)
	mux.HandleFunc("GET /triages/{id}", h.GetTriage)
	mux.HandleFunc("PUT /triages/{id}", h.UpdateTriage)
	mux.HandleFunc("DELETE /triages/{id}", h.DeleteTriage)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"triage-service"}`))
	})
	return mux
}
