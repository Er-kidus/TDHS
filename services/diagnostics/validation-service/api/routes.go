package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/validation-service/internal/handler"
	"github.com/tenadam/validation-service/internal/repository"
	"github.com/tenadam/validation-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /validations", h.CreateValidation)
	mux.HandleFunc("GET /validations", h.ListValidations)
	mux.HandleFunc("GET /validations/{id}", h.GetValidation)
	mux.HandleFunc("PUT /validations/{id}", h.UpdateValidation)
	mux.HandleFunc("DELETE /validations/{id}", h.DeleteValidation)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"validation-service"}`))
	})
	return mux
}
