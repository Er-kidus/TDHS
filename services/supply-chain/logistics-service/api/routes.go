package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/logistics-service/internal/handler"
	"github.com/tenadam/logistics-service/internal/repository"
	"github.com/tenadam/logistics-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /logisticss", h.CreateLogistics)
	mux.HandleFunc("GET /logisticss", h.ListLogisticss)
	mux.HandleFunc("GET /logisticss/{id}", h.GetLogistics)
	mux.HandleFunc("PUT /logisticss/{id}", h.UpdateLogistics)
	mux.HandleFunc("DELETE /logisticss/{id}", h.DeleteLogistics)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"logistics-service"}`))
	})
	return mux
}
