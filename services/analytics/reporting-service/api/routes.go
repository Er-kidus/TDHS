package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/reporting-service/internal/handler"
	"github.com/tenadam/reporting-service/internal/repository"
	"github.com/tenadam/reporting-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /reportings", h.CreateReporting)
	mux.HandleFunc("GET /reportings", h.ListReportings)
	mux.HandleFunc("GET /reportings/{id}", h.GetReporting)
	mux.HandleFunc("PUT /reportings/{id}", h.UpdateReporting)
	mux.HandleFunc("DELETE /reportings/{id}", h.DeleteReporting)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"reporting-service"}`))
	})
	return mux
}
