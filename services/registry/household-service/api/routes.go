package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/household-service/internal/handler"
	"github.com/tenadam/household-service/internal/repository"
	"github.com/tenadam/household-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /households", h.CreateHousehold)
	mux.HandleFunc("GET /households", h.ListHouseholds)
	mux.HandleFunc("GET /households/{id}", h.GetHousehold)
	mux.HandleFunc("PUT /households/{id}", h.UpdateHousehold)
	mux.HandleFunc("DELETE /households/{id}", h.DeleteHousehold)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"household-service"}`))
	})
	return mux
}
