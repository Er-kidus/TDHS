package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/imaging-service/internal/handler"
	"github.com/tenadam/imaging-service/internal/repository"
	"github.com/tenadam/imaging-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /imagings", h.CreateImaging)
	mux.HandleFunc("GET /imagings", h.ListImagings)
	mux.HandleFunc("GET /imagings/{id}", h.GetImaging)
	mux.HandleFunc("PUT /imagings/{id}", h.UpdateImaging)
	mux.HandleFunc("DELETE /imagings/{id}", h.DeleteImaging)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"imaging-service"}`))
	})
	return mux
}
