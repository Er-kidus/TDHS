package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/emergency-service/internal/handler"
	"github.com/tenadam/emergency-service/internal/repository"
	"github.com/tenadam/emergency-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /emergencys", h.CreateEmergency)
	mux.HandleFunc("GET /emergencys", h.ListEmergencys)
	mux.HandleFunc("GET /emergencys/{id}", h.GetEmergency)
	mux.HandleFunc("PUT /emergencys/{id}", h.UpdateEmergency)
	mux.HandleFunc("DELETE /emergencys/{id}", h.DeleteEmergency)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"emergency-service"}`))
	})
	return mux
}
