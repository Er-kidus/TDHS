package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/auth-service/internal/handler"
	"github.com/tenadam/auth-service/internal/repository"
	"github.com/tenadam/auth-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /auths", h.CreateAuth)
	mux.HandleFunc("GET /auths", h.ListAuths)
	mux.HandleFunc("GET /auths/{id}", h.GetAuth)
	mux.HandleFunc("PUT /auths/{id}", h.UpdateAuth)
	mux.HandleFunc("DELETE /auths/{id}", h.DeleteAuth)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"auth-service"}`))
	})
	return mux
}
