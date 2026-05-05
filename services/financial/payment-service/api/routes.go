package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/payment-service/internal/handler"
	"github.com/tenadam/payment-service/internal/repository"
	"github.com/tenadam/payment-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /payments", h.CreatePayment)
	mux.HandleFunc("GET /payments", h.ListPayments)
	mux.HandleFunc("GET /payments/{id}", h.GetPayment)
	mux.HandleFunc("PUT /payments/{id}", h.UpdatePayment)
	mux.HandleFunc("DELETE /payments/{id}", h.DeletePayment)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"payment-service"}`))
	})
	return mux
}
