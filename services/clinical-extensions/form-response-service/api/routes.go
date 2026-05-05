package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/form-response-service/internal/handler"
	"github.com/tenadam/form-response-service/internal/repository"
	"github.com/tenadam/form-response-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /form-responses", h.CreateFormResponse)
	mux.HandleFunc("GET /form-responses", h.ListFormResponses)
	mux.HandleFunc("GET /form-responses/{id}", h.GetFormResponse)
	mux.HandleFunc("PUT /form-responses/{id}", h.UpdateFormResponse)
	mux.HandleFunc("DELETE /form-responses/{id}", h.DeleteFormResponse)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"form-response-service"}`))
	})
	return mux
}
