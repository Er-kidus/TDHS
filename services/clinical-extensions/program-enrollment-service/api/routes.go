package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/program-enrollment-service/internal/handler"
	"github.com/tenadam/program-enrollment-service/internal/repository"
	"github.com/tenadam/program-enrollment-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /program-enrollments", h.CreateProgramEnrollment)
	mux.HandleFunc("GET /program-enrollments", h.ListProgramEnrollments)
	mux.HandleFunc("GET /program-enrollments/{id}", h.GetProgramEnrollment)
	mux.HandleFunc("PUT /program-enrollments/{id}", h.UpdateProgramEnrollment)
	mux.HandleFunc("DELETE /program-enrollments/{id}", h.DeleteProgramEnrollment)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"program-enrollment-service"}`))
	})
	return mux
}
