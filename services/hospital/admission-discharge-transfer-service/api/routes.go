package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/admission-discharge-transfer-service/internal/handler"
	"github.com/tenadam/admission-discharge-transfer-service/internal/repository"
	"github.com/tenadam/admission-discharge-transfer-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /admission-discharge-transfers", h.CreateAdmissionDischargeTransfer)
	mux.HandleFunc("GET /admission-discharge-transfers", h.ListAdmissionDischargeTransfers)
	mux.HandleFunc("GET /admission-discharge-transfers/{id}", h.GetAdmissionDischargeTransfer)
	mux.HandleFunc("PUT /admission-discharge-transfers/{id}", h.UpdateAdmissionDischargeTransfer)
	mux.HandleFunc("DELETE /admission-discharge-transfers/{id}", h.DeleteAdmissionDischargeTransfer)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"admission-discharge-transfer-service"}`))
	})
	return mux
}
