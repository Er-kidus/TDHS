package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/nursing-dashboard-service/internal/handler"
	"github.com/tenadam/nursing-dashboard-service/internal/repository"
	"github.com/tenadam/nursing-dashboard-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /nursing-dashboards", h.CreateNursingDashboard)
	mux.HandleFunc("GET /nursing-dashboards", h.ListNursingDashboards)
	mux.HandleFunc("GET /nursing-dashboards/{id}", h.GetNursingDashboard)
	mux.HandleFunc("PUT /nursing-dashboards/{id}", h.UpdateNursingDashboard)
	mux.HandleFunc("DELETE /nursing-dashboards/{id}", h.DeleteNursingDashboard)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"nursing-dashboard-service"}`))
	})
	return mux
}
