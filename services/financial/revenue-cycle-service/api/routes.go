package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/revenue-cycle-service/internal/handler"
	"github.com/tenadam/revenue-cycle-service/internal/repository"
	"github.com/tenadam/revenue-cycle-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /revenue-cycles", h.CreateRevenueCycle)
	mux.HandleFunc("GET /revenue-cycles", h.ListRevenueCycles)
	mux.HandleFunc("GET /revenue-cycles/{id}", h.GetRevenueCycle)
	mux.HandleFunc("PUT /revenue-cycles/{id}", h.UpdateRevenueCycle)
	mux.HandleFunc("DELETE /revenue-cycles/{id}", h.DeleteRevenueCycle)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"revenue-cycle-service"}`))
	})
	return mux
}
