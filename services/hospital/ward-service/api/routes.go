package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/ward-service/internal/handler"
	"github.com/tenadam/ward-service/internal/repository"
	"github.com/tenadam/ward-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /wards", h.CreateWard)
	mux.HandleFunc("GET /wards", h.ListWards)
	mux.HandleFunc("GET /wards/{id}", h.GetWard)
	mux.HandleFunc("PUT /wards/{id}", h.UpdateWard)
	mux.HandleFunc("DELETE /wards/{id}", h.DeleteWard)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"ward-service"}`))
	})
	return mux
}
