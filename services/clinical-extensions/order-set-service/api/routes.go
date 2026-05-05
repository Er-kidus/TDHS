package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/order-set-service/internal/handler"
	"github.com/tenadam/order-set-service/internal/repository"
	"github.com/tenadam/order-set-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /order-sets", h.CreateOrderSet)
	mux.HandleFunc("GET /order-sets", h.ListOrderSets)
	mux.HandleFunc("GET /order-sets/{id}", h.GetOrderSet)
	mux.HandleFunc("PUT /order-sets/{id}", h.UpdateOrderSet)
	mux.HandleFunc("DELETE /order-sets/{id}", h.DeleteOrderSet)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"order-set-service"}`))
	})
	return mux
}
