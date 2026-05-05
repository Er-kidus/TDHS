package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/remote-monitoring-service/internal/handler"
	"github.com/tenadam/remote-monitoring-service/internal/repository"
	"github.com/tenadam/remote-monitoring-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /remote-monitorings", h.CreateRemoteMonitoring)
	mux.HandleFunc("GET /remote-monitorings", h.ListRemoteMonitorings)
	mux.HandleFunc("GET /remote-monitorings/{id}", h.GetRemoteMonitoring)
	mux.HandleFunc("PUT /remote-monitorings/{id}", h.UpdateRemoteMonitoring)
	mux.HandleFunc("DELETE /remote-monitorings/{id}", h.DeleteRemoteMonitoring)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"remote-monitoring-service"}`))
	})
	return mux
}
