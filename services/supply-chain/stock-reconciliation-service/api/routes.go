package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/stock-reconciliation-service/internal/handler"
	"github.com/tenadam/stock-reconciliation-service/internal/repository"
	"github.com/tenadam/stock-reconciliation-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /stock-reconciliations", h.CreateStockReconciliation)
	mux.HandleFunc("GET /stock-reconciliations", h.ListStockReconciliations)
	mux.HandleFunc("GET /stock-reconciliations/{id}", h.GetStockReconciliation)
	mux.HandleFunc("PUT /stock-reconciliations/{id}", h.UpdateStockReconciliation)
	mux.HandleFunc("DELETE /stock-reconciliations/{id}", h.DeleteStockReconciliation)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"stock-reconciliation-service"}`))
	})
	return mux
}
