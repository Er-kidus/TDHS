package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/pharmacy-inventory-service/internal/handler"
	"github.com/tenadam/pharmacy-inventory-service/internal/repository"
	"github.com/tenadam/pharmacy-inventory-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /pharmacy-inventorys", h.CreatePharmacyInventory)
	mux.HandleFunc("GET /pharmacy-inventorys", h.ListPharmacyInventorys)
	mux.HandleFunc("GET /pharmacy-inventorys/{id}", h.GetPharmacyInventory)
	mux.HandleFunc("PUT /pharmacy-inventorys/{id}", h.UpdatePharmacyInventory)
	mux.HandleFunc("DELETE /pharmacy-inventorys/{id}", h.DeletePharmacyInventory)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"pharmacy-inventory-service"}`))
	})
	return mux
}
