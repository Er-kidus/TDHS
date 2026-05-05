package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/check-in-service/internal/handler"
	"github.com/tenadam/check-in-service/internal/repository"
	"github.com/tenadam/check-in-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /check-ins", h.CreateCheckIn)
	mux.HandleFunc("GET /check-ins", h.ListCheckIns)
	mux.HandleFunc("GET /check-ins/{id}", h.GetCheckIn)
	mux.HandleFunc("PUT /check-ins/{id}", h.UpdateCheckIn)
	mux.HandleFunc("DELETE /check-ins/{id}", h.DeleteCheckIn)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"check-in-service"}`))
	})
	return mux
}
