package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/procurement-service/internal/handler"
	"github.com/tenadam/procurement-service/internal/repository"
	"github.com/tenadam/procurement-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /procurements", h.CreateProcurement)
	mux.HandleFunc("GET /procurements", h.ListProcurements)
	mux.HandleFunc("GET /procurements/{id}", h.GetProcurement)
	mux.HandleFunc("PUT /procurements/{id}", h.UpdateProcurement)
	mux.HandleFunc("DELETE /procurements/{id}", h.DeleteProcurement)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"procurement-service"}`))
	})
	return mux
}
