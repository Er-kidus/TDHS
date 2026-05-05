package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/warehouse-service/internal/handler"
	"github.com/tenadam/warehouse-service/internal/repository"
	"github.com/tenadam/warehouse-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /warehouses", h.CreateWarehouse)
	mux.HandleFunc("GET /warehouses", h.ListWarehouses)
	mux.HandleFunc("GET /warehouses/{id}", h.GetWarehouse)
	mux.HandleFunc("PUT /warehouses/{id}", h.UpdateWarehouse)
	mux.HandleFunc("DELETE /warehouses/{id}", h.DeleteWarehouse)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"warehouse-service"}`))
	})
	return mux
}
