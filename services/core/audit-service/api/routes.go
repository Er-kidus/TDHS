package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/audit-service/internal/handler"
	"github.com/tenadam/audit-service/internal/repository"
	"github.com/tenadam/audit-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /audits", h.CreateAudit)
	mux.HandleFunc("GET /audits", h.ListAudits)
	mux.HandleFunc("GET /audits/{id}", h.GetAudit)
	mux.HandleFunc("PUT /audits/{id}", h.UpdateAudit)
	mux.HandleFunc("DELETE /audits/{id}", h.DeleteAudit)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"audit-service"}`))
	})
	return mux
}
