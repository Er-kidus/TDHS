package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/careplan-service/internal/handler"
	"github.com/tenadam/careplan-service/internal/repository"
	"github.com/tenadam/careplan-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /careplans", h.CreateCareplan)
	mux.HandleFunc("GET /careplans", h.ListCareplans)
	mux.HandleFunc("GET /careplans/{id}", h.GetCareplan)
	mux.HandleFunc("PUT /careplans/{id}", h.UpdateCareplan)
	mux.HandleFunc("DELETE /careplans/{id}", h.DeleteCareplan)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"careplan-service"}`))
	})
	return mux
}
