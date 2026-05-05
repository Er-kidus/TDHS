package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/claim-adjudication-service/internal/handler"
	"github.com/tenadam/claim-adjudication-service/internal/repository"
	"github.com/tenadam/claim-adjudication-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /claim-adjudications", h.CreateClaimAdjudication)
	mux.HandleFunc("GET /claim-adjudications", h.ListClaimAdjudications)
	mux.HandleFunc("GET /claim-adjudications/{id}", h.GetClaimAdjudication)
	mux.HandleFunc("PUT /claim-adjudications/{id}", h.UpdateClaimAdjudication)
	mux.HandleFunc("DELETE /claim-adjudications/{id}", h.DeleteClaimAdjudication)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"claim-adjudication-service"}`))
	})
	return mux
}
