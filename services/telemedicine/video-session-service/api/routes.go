package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/video-session-service/internal/handler"
	"github.com/tenadam/video-session-service/internal/repository"
	"github.com/tenadam/video-session-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /video-sessions", h.CreateVideoSession)
	mux.HandleFunc("GET /video-sessions", h.ListVideoSessions)
	mux.HandleFunc("GET /video-sessions/{id}", h.GetVideoSession)
	mux.HandleFunc("PUT /video-sessions/{id}", h.UpdateVideoSession)
	mux.HandleFunc("DELETE /video-sessions/{id}", h.DeleteVideoSession)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"video-session-service"}`))
	})
	return mux
}
