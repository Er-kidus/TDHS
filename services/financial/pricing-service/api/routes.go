package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/pricing-service/internal/handler"
	"github.com/tenadam/pricing-service/internal/repository"
	"github.com/tenadam/pricing-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /pricings", h.CreatePricing)
	mux.HandleFunc("GET /pricings", h.ListPricings)
	mux.HandleFunc("GET /pricings/{id}", h.GetPricing)
	mux.HandleFunc("PUT /pricings/{id}", h.UpdatePricing)
	mux.HandleFunc("DELETE /pricings/{id}", h.DeletePricing)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"pricing-service"}`))
	})
	return mux
}
