package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/form-service/internal/handler"
	"github.com/tenadam/form-service/internal/repository"
	"github.com/tenadam/form-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /forms", h.CreateForm)
	mux.HandleFunc("GET /forms", h.ListForms)
	mux.HandleFunc("GET /forms/{id}", h.GetForm)
	mux.HandleFunc("PUT /forms/{id}", h.UpdateForm)
	mux.HandleFunc("DELETE /forms/{id}", h.DeleteForm)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"form-service"}`))
	})
	return mux
}
