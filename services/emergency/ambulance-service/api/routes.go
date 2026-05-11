package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/ambulance-service/internal/handler"
	"github.com/tenadam/ambulance-service/internal/repository"
	"github.com/tenadam/ambulance-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /ambulances", h.CreateAmbulance)
	mux.HandleFunc("GET /ambulances", h.ListAmbulances)
	mux.HandleFunc("GET /ambulances/{id}", h.GetAmbulance)
	mux.HandleFunc("PUT /ambulances/{id}", h.UpdateAmbulance)
	mux.HandleFunc("DELETE /ambulances/{id}", h.DeleteAmbulance)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"ambulance-service"}`))
	})
	return mux
}
