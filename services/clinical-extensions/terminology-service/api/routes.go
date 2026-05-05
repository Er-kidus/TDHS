package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/terminology-service/internal/handler"
	"github.com/tenadam/terminology-service/internal/repository"
	"github.com/tenadam/terminology-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /terminologys", h.CreateTerminology)
	mux.HandleFunc("GET /terminologys", h.ListTerminologys)
	mux.HandleFunc("GET /terminologys/{id}", h.GetTerminology)
	mux.HandleFunc("PUT /terminologys/{id}", h.UpdateTerminology)
	mux.HandleFunc("DELETE /terminologys/{id}", h.DeleteTerminology)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"terminology-service"}`))
	})
	return mux
}
