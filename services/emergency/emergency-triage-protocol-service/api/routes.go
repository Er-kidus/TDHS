package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/emergency-triage-protocol-service/internal/handler"
	"github.com/tenadam/emergency-triage-protocol-service/internal/repository"
	"github.com/tenadam/emergency-triage-protocol-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /emergency-triage-protocols", h.CreateEmergencyTriageProtocol)
	mux.HandleFunc("GET /emergency-triage-protocols", h.ListEmergencyTriageProtocols)
	mux.HandleFunc("GET /emergency-triage-protocols/{id}", h.GetEmergencyTriageProtocol)
	mux.HandleFunc("PUT /emergency-triage-protocols/{id}", h.UpdateEmergencyTriageProtocol)
	mux.HandleFunc("DELETE /emergency-triage-protocols/{id}", h.DeleteEmergencyTriageProtocol)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"emergency-triage-protocol-service"}`))
	})
	return mux
}
