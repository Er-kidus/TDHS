package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/billing-service/internal/handler"
	"github.com/tenadam/billing-service/internal/repository"
	"github.com/tenadam/billing-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /billings", h.CreateBilling)
	mux.HandleFunc("GET /billings", h.ListBillings)
	mux.HandleFunc("GET /billings/{id}", h.GetBilling)
	mux.HandleFunc("PUT /billings/{id}", h.UpdateBilling)
	mux.HandleFunc("DELETE /billings/{id}", h.DeleteBilling)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"billing-service"}`))
	})
	return mux
}
