package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/identifier-service/internal/handler"
	"github.com/tenadam/identifier-service/internal/repository"
	"github.com/tenadam/identifier-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /identifiers", h.CreateIdentifier)
	mux.HandleFunc("GET /identifiers", h.ListIdentifiers)
	mux.HandleFunc("GET /identifiers/{id}", h.GetIdentifier)
	mux.HandleFunc("PUT /identifiers/{id}", h.UpdateIdentifier)
	mux.HandleFunc("DELETE /identifiers/{id}", h.DeleteIdentifier)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"identifier-service"}`))
	})
	return mux
}
