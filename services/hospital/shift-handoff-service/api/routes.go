package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/shift-handoff-service/internal/handler"
	"github.com/tenadam/shift-handoff-service/internal/repository"
	"github.com/tenadam/shift-handoff-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /shift-handoffs", h.CreateShiftHandoff)
	mux.HandleFunc("GET /shift-handoffs", h.ListShiftHandoffs)
	mux.HandleFunc("GET /shift-handoffs/{id}", h.GetShiftHandoff)
	mux.HandleFunc("PUT /shift-handoffs/{id}", h.UpdateShiftHandoff)
	mux.HandleFunc("DELETE /shift-handoffs/{id}", h.DeleteShiftHandoff)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"shift-handoff-service"}`))
	})
	return mux
}
