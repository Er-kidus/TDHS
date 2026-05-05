package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/specimen-service/internal/handler"
	"github.com/tenadam/specimen-service/internal/repository"
	"github.com/tenadam/specimen-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /specimens", h.CreateSpecimen)
	mux.HandleFunc("GET /specimens", h.ListSpecimens)
	mux.HandleFunc("GET /specimens/{id}", h.GetSpecimen)
	mux.HandleFunc("PUT /specimens/{id}", h.UpdateSpecimen)
	mux.HandleFunc("DELETE /specimens/{id}", h.DeleteSpecimen)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"specimen-service"}`))
	})
	return mux
}
