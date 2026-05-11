package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/procedure-service/internal/handler"
	"github.com/tenadam/procedure-service/internal/repository"
	"github.com/tenadam/procedure-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /procedures", h.CreateProcedure)
	mux.HandleFunc("GET /procedures", h.ListProcedures)
	mux.HandleFunc("GET /procedures/{id}", h.GetProcedure)
	mux.HandleFunc("PUT /procedures/{id}", h.UpdateProcedure)
	mux.HandleFunc("DELETE /procedures/{id}", h.DeleteProcedure)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"procedure-service"}`))
	})
	return mux
}
