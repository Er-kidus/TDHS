package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/dashboard-service/internal/handler"
	"github.com/tenadam/dashboard-service/internal/repository"
	"github.com/tenadam/dashboard-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /dashboards", h.CreateDashboard)
	mux.HandleFunc("GET /dashboards", h.ListDashboards)
	mux.HandleFunc("GET /dashboards/{id}", h.GetDashboard)
	mux.HandleFunc("PUT /dashboards/{id}", h.UpdateDashboard)
	mux.HandleFunc("DELETE /dashboards/{id}", h.DeleteDashboard)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"dashboard-service"}`))
	})
	return mux
}
