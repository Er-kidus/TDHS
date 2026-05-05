package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/referral-service/internal/handler"
	"github.com/tenadam/referral-service/internal/repository"
	"github.com/tenadam/referral-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /referrals", h.CreateReferral)
	mux.HandleFunc("GET /referrals", h.ListReferrals)
	mux.HandleFunc("GET /referrals/{id}", h.GetReferral)
	mux.HandleFunc("PUT /referrals/{id}", h.UpdateReferral)
	mux.HandleFunc("DELETE /referrals/{id}", h.DeleteReferral)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"referral-service"}`))
	})
	return mux
}
