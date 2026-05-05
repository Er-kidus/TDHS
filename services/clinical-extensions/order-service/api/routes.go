package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/order-service/internal/handler"
	"github.com/tenadam/order-service/internal/repository"
	"github.com/tenadam/order-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /orders", h.CreateOrder)
	mux.HandleFunc("GET /orders", h.ListOrders)
	mux.HandleFunc("GET /orders/{id}", h.GetOrder)
	mux.HandleFunc("PUT /orders/{id}", h.UpdateOrder)
	mux.HandleFunc("DELETE /orders/{id}", h.DeleteOrder)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"order-service"}`))
	})
	return mux
}
