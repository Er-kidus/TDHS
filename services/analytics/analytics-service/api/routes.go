package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/analytics-service/internal/handler"
	"github.com/tenadam/analytics-service/internal/repository"
	"github.com/tenadam/analytics-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /analyticss", h.CreateAnalytics)
	mux.HandleFunc("GET /analyticss", h.ListAnalyticss)
	mux.HandleFunc("GET /analyticss/{id}", h.GetAnalytics)
	mux.HandleFunc("PUT /analyticss/{id}", h.UpdateAnalytics)
	mux.HandleFunc("DELETE /analyticss/{id}", h.DeleteAnalytics)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"analytics-service"}`))
	})
	return mux
}
