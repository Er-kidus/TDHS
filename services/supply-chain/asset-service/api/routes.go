package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/asset-service/internal/handler"
	"github.com/tenadam/asset-service/internal/repository"
	"github.com/tenadam/asset-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /assets", h.CreateAsset)
	mux.HandleFunc("GET /assets", h.ListAssets)
	mux.HandleFunc("GET /assets/{id}", h.GetAsset)
	mux.HandleFunc("PUT /assets/{id}", h.UpdateAsset)
	mux.HandleFunc("DELETE /assets/{id}", h.DeleteAsset)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"asset-service"}`))
	})
	return mux
}
