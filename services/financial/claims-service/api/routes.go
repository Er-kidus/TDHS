package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/claims-service/internal/handler"
	"github.com/tenadam/claims-service/internal/repository"
	"github.com/tenadam/claims-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /claimss", h.CreateClaims)
	mux.HandleFunc("GET /claimss", h.ListClaimss)
	mux.HandleFunc("GET /claimss/{id}", h.GetClaims)
	mux.HandleFunc("PUT /claimss/{id}", h.UpdateClaims)
	mux.HandleFunc("DELETE /claimss/{id}", h.DeleteClaims)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"claims-service"}`))
	})
	return mux
}
