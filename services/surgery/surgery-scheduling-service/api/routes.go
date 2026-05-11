package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/surgery-scheduling-service/internal/handler"
	"github.com/tenadam/surgery-scheduling-service/internal/repository"
	"github.com/tenadam/surgery-scheduling-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /surgery-schedulings", h.CreateSurgeryScheduling)
	mux.HandleFunc("GET /surgery-schedulings", h.ListSurgerySchedulings)
	mux.HandleFunc("GET /surgery-schedulings/{id}", h.GetSurgeryScheduling)
	mux.HandleFunc("PUT /surgery-schedulings/{id}", h.UpdateSurgeryScheduling)
	mux.HandleFunc("DELETE /surgery-schedulings/{id}", h.DeleteSurgeryScheduling)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"surgery-scheduling-service"}`))
	})
	return mux
}
