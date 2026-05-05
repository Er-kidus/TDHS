package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/session-service/internal/handler"
	"github.com/tenadam/session-service/internal/repository"
	"github.com/tenadam/session-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /sessions", h.CreateSession)
	mux.HandleFunc("GET /sessions", h.ListSessions)
	mux.HandleFunc("GET /sessions/{id}", h.GetSession)
	mux.HandleFunc("PUT /sessions/{id}", h.UpdateSession)
	mux.HandleFunc("DELETE /sessions/{id}", h.DeleteSession)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"session-service"}`))
	})
	return mux
}
