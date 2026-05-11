package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/national-reporting-service/internal/handler"
	"github.com/tenadam/national-reporting-service/internal/repository"
	"github.com/tenadam/national-reporting-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /national-reportings", h.CreateNationalReporting)
	mux.HandleFunc("GET /national-reportings", h.ListNationalReportings)
	mux.HandleFunc("GET /national-reportings/{id}", h.GetNationalReporting)
	mux.HandleFunc("PUT /national-reportings/{id}", h.UpdateNationalReporting)
	mux.HandleFunc("DELETE /national-reportings/{id}", h.DeleteNationalReporting)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"national-reporting-service"}`))
	})
	return mux
}
