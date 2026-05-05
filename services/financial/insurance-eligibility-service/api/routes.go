package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/insurance-eligibility-service/internal/handler"
	"github.com/tenadam/insurance-eligibility-service/internal/repository"
	"github.com/tenadam/insurance-eligibility-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /insurance-eligibilitys", h.CreateInsuranceEligibility)
	mux.HandleFunc("GET /insurance-eligibilitys", h.ListInsuranceEligibilitys)
	mux.HandleFunc("GET /insurance-eligibilitys/{id}", h.GetInsuranceEligibility)
	mux.HandleFunc("PUT /insurance-eligibilitys/{id}", h.UpdateInsuranceEligibility)
	mux.HandleFunc("DELETE /insurance-eligibilitys/{id}", h.DeleteInsuranceEligibility)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"insurance-eligibility-service"}`))
	})
	return mux
}
