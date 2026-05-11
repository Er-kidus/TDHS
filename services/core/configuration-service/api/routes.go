package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/configuration-service/internal/handler"
	"github.com/tenadam/configuration-service/internal/repository"
	"github.com/tenadam/configuration-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /configurations", h.CreateConfiguration)
	mux.HandleFunc("GET /configurations", h.ListConfigurations)
	mux.HandleFunc("GET /configurations/{id}", h.GetConfiguration)
	mux.HandleFunc("PUT /configurations/{id}", h.UpdateConfiguration)
	mux.HandleFunc("DELETE /configurations/{id}", h.DeleteConfiguration)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"configuration-service"}`))
	})
	return mux
}
