package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/telemedicine-service/internal/handler"
	"github.com/tenadam/telemedicine-service/internal/repository"
	"github.com/tenadam/telemedicine-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /telemedicines", h.CreateTelemedicine)
	mux.HandleFunc("GET /telemedicines", h.ListTelemedicines)
	mux.HandleFunc("GET /telemedicines/{id}", h.GetTelemedicine)
	mux.HandleFunc("PUT /telemedicines/{id}", h.UpdateTelemedicine)
	mux.HandleFunc("DELETE /telemedicines/{id}", h.DeleteTelemedicine)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"telemedicine-service"}`))
	})
	return mux
}
