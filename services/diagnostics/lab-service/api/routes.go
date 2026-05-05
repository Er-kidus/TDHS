package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/lab-service/internal/handler"
	"github.com/tenadam/lab-service/internal/repository"
	"github.com/tenadam/lab-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /labs", h.CreateLab)
	mux.HandleFunc("GET /labs", h.ListLabs)
	mux.HandleFunc("GET /labs/{id}", h.GetLab)
	mux.HandleFunc("PUT /labs/{id}", h.UpdateLab)
	mux.HandleFunc("DELETE /labs/{id}", h.DeleteLab)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"lab-service"}`))
	})
	return mux
}
