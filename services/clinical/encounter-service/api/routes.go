package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/encounter-service/internal/handler"
	"github.com/tenadam/encounter-service/internal/repository"
	"github.com/tenadam/encounter-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /encounters", h.CreateEncounter)
	mux.HandleFunc("GET /encounters", h.ListEncounters)
	mux.HandleFunc("GET /encounters/{id}", h.GetEncounter)
	mux.HandleFunc("PUT /encounters/{id}", h.UpdateEncounter)
	mux.HandleFunc("DELETE /encounters/{id}", h.DeleteEncounter)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"encounter-service"}`))
	})
	return mux
}
