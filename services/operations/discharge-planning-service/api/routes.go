package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/discharge-planning-service/internal/handler"
	"github.com/tenadam/discharge-planning-service/internal/repository"
	"github.com/tenadam/discharge-planning-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /discharge-plannings", h.CreateDischargePlanning)
	mux.HandleFunc("GET /discharge-plannings", h.ListDischargePlannings)
	mux.HandleFunc("GET /discharge-plannings/{id}", h.GetDischargePlanning)
	mux.HandleFunc("PUT /discharge-plannings/{id}", h.UpdateDischargePlanning)
	mux.HandleFunc("DELETE /discharge-plannings/{id}", h.DeleteDischargePlanning)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"discharge-planning-service"}`))
	})
	return mux
}
