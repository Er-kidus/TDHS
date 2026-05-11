package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/ussd-service/internal/handler"
	"github.com/tenadam/ussd-service/internal/repository"
	"github.com/tenadam/ussd-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /ussds", h.CreateUssd)
	mux.HandleFunc("GET /ussds", h.ListUssds)
	mux.HandleFunc("GET /ussds/{id}", h.GetUssd)
	mux.HandleFunc("PUT /ussds/{id}", h.UpdateUssd)
	mux.HandleFunc("DELETE /ussds/{id}", h.DeleteUssd)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"ussd-service"}`))
	})
	return mux
}
