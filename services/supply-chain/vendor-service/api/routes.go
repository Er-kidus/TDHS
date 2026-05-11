package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/vendor-service/internal/handler"
	"github.com/tenadam/vendor-service/internal/repository"
	"github.com/tenadam/vendor-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /vendors", h.CreateVendor)
	mux.HandleFunc("GET /vendors", h.ListVendors)
	mux.HandleFunc("GET /vendors/{id}", h.GetVendor)
	mux.HandleFunc("PUT /vendors/{id}", h.UpdateVendor)
	mux.HandleFunc("DELETE /vendors/{id}", h.DeleteVendor)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"vendor-service"}`))
	})
	return mux
}
