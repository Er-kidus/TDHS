package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/data-quality-service/internal/handler"
	"github.com/tenadam/data-quality-service/internal/repository"
	"github.com/tenadam/data-quality-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /data-qualitys", h.CreateDataQuality)
	mux.HandleFunc("GET /data-qualitys", h.ListDataQualitys)
	mux.HandleFunc("GET /data-qualitys/{id}", h.GetDataQuality)
	mux.HandleFunc("PUT /data-qualitys/{id}", h.UpdateDataQuality)
	mux.HandleFunc("DELETE /data-qualitys/{id}", h.DeleteDataQuality)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"data-quality-service"}`))
	})
	return mux
}
