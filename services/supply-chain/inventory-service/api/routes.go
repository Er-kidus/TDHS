package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/inventory-service/internal/handler"
	"github.com/tenadam/inventory-service/internal/repository"
	"github.com/tenadam/inventory-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /inventorys", h.CreateInventory)
	mux.HandleFunc("GET /inventorys", h.ListInventorys)
	mux.HandleFunc("GET /inventorys/{id}", h.GetInventory)
	mux.HandleFunc("PUT /inventorys/{id}", h.UpdateInventory)
	mux.HandleFunc("DELETE /inventorys/{id}", h.DeleteInventory)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"inventory-service"}`))
	})
	return mux
}
