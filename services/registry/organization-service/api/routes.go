package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/organization-service/internal/handler"
	"github.com/tenadam/organization-service/internal/repository"
	"github.com/tenadam/organization-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /organizations", h.CreateOrganization)
	mux.HandleFunc("GET /organizations", h.ListOrganizations)
	mux.HandleFunc("GET /organizations/{id}", h.GetOrganization)
	mux.HandleFunc("PUT /organizations/{id}", h.UpdateOrganization)
	mux.HandleFunc("DELETE /organizations/{id}", h.DeleteOrganization)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"organization-service"}`))
	})
	return mux
}
