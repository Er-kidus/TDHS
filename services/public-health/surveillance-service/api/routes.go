package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/surveillance-service/internal/handler"
	"github.com/tenadam/surveillance-service/internal/repository"
	"github.com/tenadam/surveillance-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /surveillances", h.CreateSurveillance)
	mux.HandleFunc("GET /surveillances", h.ListSurveillances)
	mux.HandleFunc("GET /surveillances/{id}", h.GetSurveillance)
	mux.HandleFunc("PUT /surveillances/{id}", h.UpdateSurveillance)
	mux.HandleFunc("DELETE /surveillances/{id}", h.DeleteSurveillance)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"surveillance-service"}`))
	})
	return mux
}
