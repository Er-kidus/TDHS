package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/surgery-service/internal/handler"
	"github.com/tenadam/surgery-service/internal/repository"
	"github.com/tenadam/surgery-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /surgerys", h.CreateSurgery)
	mux.HandleFunc("GET /surgerys", h.ListSurgerys)
	mux.HandleFunc("GET /surgerys/{id}", h.GetSurgery)
	mux.HandleFunc("PUT /surgerys/{id}", h.UpdateSurgery)
	mux.HandleFunc("DELETE /surgerys/{id}", h.DeleteSurgery)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"surgery-service"}`))
	})
	return mux
}
