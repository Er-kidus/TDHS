package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/program-reporting-service/internal/handler"
	"github.com/tenadam/program-reporting-service/internal/repository"
	"github.com/tenadam/program-reporting-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /program-reportings", h.CreateProgramReporting)
	mux.HandleFunc("GET /program-reportings", h.ListProgramReportings)
	mux.HandleFunc("GET /program-reportings/{id}", h.GetProgramReporting)
	mux.HandleFunc("PUT /program-reportings/{id}", h.UpdateProgramReporting)
	mux.HandleFunc("DELETE /program-reportings/{id}", h.DeleteProgramReporting)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"program-reporting-service"}`))
	})
	return mux
}
