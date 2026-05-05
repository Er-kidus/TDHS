package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/audit-analytics-service/internal/handler"
	"github.com/tenadam/audit-analytics-service/internal/repository"
	"github.com/tenadam/audit-analytics-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /audit-analyticss", h.CreateAuditAnalytics)
	mux.HandleFunc("GET /audit-analyticss", h.ListAuditAnalyticss)
	mux.HandleFunc("GET /audit-analyticss/{id}", h.GetAuditAnalytics)
	mux.HandleFunc("PUT /audit-analyticss/{id}", h.UpdateAuditAnalytics)
	mux.HandleFunc("DELETE /audit-analyticss/{id}", h.DeleteAuditAnalytics)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"audit-analytics-service"}`))
	})
	return mux
}
