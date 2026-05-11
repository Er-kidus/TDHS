package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/practitioner-service/internal/handler"
	"github.com/tenadam/practitioner-service/internal/repository"
	"github.com/tenadam/practitioner-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /practitioners", h.CreatePractitioner)
	mux.HandleFunc("GET /practitioners", h.ListPractitioners)
	mux.HandleFunc("GET /practitioners/{id}", h.GetPractitioner)
	mux.HandleFunc("PUT /practitioners/{id}", h.UpdatePractitioner)
	mux.HandleFunc("DELETE /practitioners/{id}", h.DeletePractitioner)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"practitioner-service"}`))
	})
	return mux
}
