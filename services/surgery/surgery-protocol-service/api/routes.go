package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/surgery-protocol-service/internal/handler"
	"github.com/tenadam/surgery-protocol-service/internal/repository"
	"github.com/tenadam/surgery-protocol-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /surgery-protocols", h.CreateSurgeryProtocol)
	mux.HandleFunc("GET /surgery-protocols", h.ListSurgeryProtocols)
	mux.HandleFunc("GET /surgery-protocols/{id}", h.GetSurgeryProtocol)
	mux.HandleFunc("PUT /surgery-protocols/{id}", h.UpdateSurgeryProtocol)
	mux.HandleFunc("DELETE /surgery-protocols/{id}", h.DeleteSurgeryProtocol)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"surgery-protocol-service"}`))
	})
	return mux
}
