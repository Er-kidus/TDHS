package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/appointment-service/internal/handler"
	"github.com/tenadam/appointment-service/internal/repository"
	"github.com/tenadam/appointment-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /appointments", h.CreateAppointment)
	mux.HandleFunc("GET /appointments", h.ListAppointments)
	mux.HandleFunc("GET /appointments/{id}", h.GetAppointment)
	mux.HandleFunc("PUT /appointments/{id}", h.UpdateAppointment)
	mux.HandleFunc("DELETE /appointments/{id}", h.DeleteAppointment)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"appointment-service"}`))
	})
	return mux
}
