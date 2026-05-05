package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/interoperability-service/internal/handler"
	"github.com/tenadam/interoperability-service/internal/repository"
	"github.com/tenadam/interoperability-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /interoperabilitys", h.CreateInteroperability)
	mux.HandleFunc("GET /interoperabilitys", h.ListInteroperabilitys)
	mux.HandleFunc("GET /interoperabilitys/{id}", h.GetInteroperability)
	mux.HandleFunc("PUT /interoperabilitys/{id}", h.UpdateInteroperability)
	mux.HandleFunc("DELETE /interoperabilitys/{id}", h.DeleteInteroperability)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"interoperability-service"}`))
	})
	return mux
}
