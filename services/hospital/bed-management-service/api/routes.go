package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/bed-management-service/internal/handler"
	"github.com/tenadam/bed-management-service/internal/repository"
	"github.com/tenadam/bed-management-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /bed-managements", h.CreateBedManagement)
	mux.HandleFunc("GET /bed-managements", h.ListBedManagements)
	mux.HandleFunc("GET /bed-managements/{id}", h.GetBedManagement)
	mux.HandleFunc("PUT /bed-managements/{id}", h.UpdateBedManagement)
	mux.HandleFunc("DELETE /bed-managements/{id}", h.DeleteBedManagement)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"bed-management-service"}`))
	})
	return mux
}
