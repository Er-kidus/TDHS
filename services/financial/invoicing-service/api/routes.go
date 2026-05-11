package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/invoicing-service/internal/handler"
	"github.com/tenadam/invoicing-service/internal/repository"
	"github.com/tenadam/invoicing-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /invoicings", h.CreateInvoicing)
	mux.HandleFunc("GET /invoicings", h.ListInvoicings)
	mux.HandleFunc("GET /invoicings/{id}", h.GetInvoicing)
	mux.HandleFunc("PUT /invoicings/{id}", h.UpdateInvoicing)
	mux.HandleFunc("DELETE /invoicings/{id}", h.DeleteInvoicing)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"invoicing-service"}`))
	})
	return mux
}
