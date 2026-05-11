package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/theatre-management-service/internal/handler"
	"github.com/tenadam/theatre-management-service/internal/repository"
	"github.com/tenadam/theatre-management-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /theatre-managements", h.CreateTheatreManagement)
	mux.HandleFunc("GET /theatre-managements", h.ListTheatreManagements)
	mux.HandleFunc("GET /theatre-managements/{id}", h.GetTheatreManagement)
	mux.HandleFunc("PUT /theatre-managements/{id}", h.UpdateTheatreManagement)
	mux.HandleFunc("DELETE /theatre-managements/{id}", h.DeleteTheatreManagement)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"theatre-management-service"}`))
	})
	return mux
}
