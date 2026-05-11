package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/tele-triage-service/internal/handler"
	"github.com/tenadam/tele-triage-service/internal/repository"
	"github.com/tenadam/tele-triage-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /tele-triages", h.CreateTeleTriage)
	mux.HandleFunc("GET /tele-triages", h.ListTeleTriages)
	mux.HandleFunc("GET /tele-triages/{id}", h.GetTeleTriage)
	mux.HandleFunc("PUT /tele-triages/{id}", h.UpdateTeleTriage)
	mux.HandleFunc("DELETE /tele-triages/{id}", h.DeleteTeleTriage)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"tele-triage-service"}`))
	})
	return mux
}
