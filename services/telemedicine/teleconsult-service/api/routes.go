package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/teleconsult-service/internal/handler"
	"github.com/tenadam/teleconsult-service/internal/repository"
	"github.com/tenadam/teleconsult-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /teleconsults", h.CreateTeleconsult)
	mux.HandleFunc("GET /teleconsults", h.ListTeleconsults)
	mux.HandleFunc("GET /teleconsults/{id}", h.GetTeleconsult)
	mux.HandleFunc("PUT /teleconsults/{id}", h.UpdateTeleconsult)
	mux.HandleFunc("DELETE /teleconsults/{id}", h.DeleteTeleconsult)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"teleconsult-service"}`))
	})
	return mux
}
