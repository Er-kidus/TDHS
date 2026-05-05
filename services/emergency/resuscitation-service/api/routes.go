package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/resuscitation-service/internal/handler"
	"github.com/tenadam/resuscitation-service/internal/repository"
	"github.com/tenadam/resuscitation-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /resuscitations", h.CreateResuscitation)
	mux.HandleFunc("GET /resuscitations", h.ListResuscitations)
	mux.HandleFunc("GET /resuscitations/{id}", h.GetResuscitation)
	mux.HandleFunc("PUT /resuscitations/{id}", h.UpdateResuscitation)
	mux.HandleFunc("DELETE /resuscitations/{id}", h.DeleteResuscitation)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"resuscitation-service"}`))
	})
	return mux
}
