package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/event-bus-service/internal/handler"
	"github.com/tenadam/event-bus-service/internal/repository"
	"github.com/tenadam/event-bus-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /event-buss", h.CreateEventBus)
	mux.HandleFunc("GET /event-buss", h.ListEventBuss)
	mux.HandleFunc("GET /event-buss/{id}", h.GetEventBus)
	mux.HandleFunc("PUT /event-buss/{id}", h.UpdateEventBus)
	mux.HandleFunc("DELETE /event-buss/{id}", h.DeleteEventBus)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"event-bus-service"}`))
	})
	return mux
}
