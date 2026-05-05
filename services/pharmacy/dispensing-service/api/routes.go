package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/dispensing-service/internal/handler"
	"github.com/tenadam/dispensing-service/internal/repository"
	"github.com/tenadam/dispensing-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /dispensings", h.CreateDispensing)
	mux.HandleFunc("GET /dispensings", h.ListDispensings)
	mux.HandleFunc("GET /dispensings/{id}", h.GetDispensing)
	mux.HandleFunc("PUT /dispensings/{id}", h.UpdateDispensing)
	mux.HandleFunc("DELETE /dispensings/{id}", h.DeleteDispensing)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"dispensing-service"}`))
	})
	return mux
}
