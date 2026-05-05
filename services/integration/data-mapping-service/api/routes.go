package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/data-mapping-service/internal/handler"
	"github.com/tenadam/data-mapping-service/internal/repository"
	"github.com/tenadam/data-mapping-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /data-mappings", h.CreateDataMapping)
	mux.HandleFunc("GET /data-mappings", h.ListDataMappings)
	mux.HandleFunc("GET /data-mappings/{id}", h.GetDataMapping)
	mux.HandleFunc("PUT /data-mappings/{id}", h.UpdateDataMapping)
	mux.HandleFunc("DELETE /data-mappings/{id}", h.DeleteDataMapping)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"data-mapping-service"}`))
	})
	return mux
}
