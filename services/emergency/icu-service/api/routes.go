package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/icu-service/internal/handler"
	"github.com/tenadam/icu-service/internal/repository"
	"github.com/tenadam/icu-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /icus", h.CreateIcu)
	mux.HandleFunc("GET /icus", h.ListIcus)
	mux.HandleFunc("GET /icus/{id}", h.GetIcu)
	mux.HandleFunc("PUT /icus/{id}", h.UpdateIcu)
	mux.HandleFunc("DELETE /icus/{id}", h.DeleteIcu)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"icu-service"}`))
	})
	return mux
}
