package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/result-service/internal/handler"
	"github.com/tenadam/result-service/internal/repository"
	"github.com/tenadam/result-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /results", h.CreateResult)
	mux.HandleFunc("GET /results", h.ListResults)
	mux.HandleFunc("GET /results/{id}", h.GetResult)
	mux.HandleFunc("PUT /results/{id}", h.UpdateResult)
	mux.HandleFunc("DELETE /results/{id}", h.DeleteResult)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"result-service"}`))
	})
	return mux
}
