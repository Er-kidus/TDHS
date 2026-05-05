package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/access-control-service/internal/handler"
	"github.com/tenadam/access-control-service/internal/repository"
	"github.com/tenadam/access-control-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /access-controls", h.CreateAccessControl)
	mux.HandleFunc("GET /access-controls", h.ListAccessControls)
	mux.HandleFunc("GET /access-controls/{id}", h.GetAccessControl)
	mux.HandleFunc("PUT /access-controls/{id}", h.UpdateAccessControl)
	mux.HandleFunc("DELETE /access-controls/{id}", h.DeleteAccessControl)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"access-control-service"}`))
	})
	return mux
}
