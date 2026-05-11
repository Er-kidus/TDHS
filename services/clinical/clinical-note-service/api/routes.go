package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/clinical-note-service/internal/handler"
	"github.com/tenadam/clinical-note-service/internal/repository"
	"github.com/tenadam/clinical-note-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /clinical-notes", h.CreateClinicalNote)
	mux.HandleFunc("GET /clinical-notes", h.ListClinicalNotes)
	mux.HandleFunc("GET /clinical-notes/{id}", h.GetClinicalNote)
	mux.HandleFunc("PUT /clinical-notes/{id}", h.UpdateClinicalNote)
	mux.HandleFunc("DELETE /clinical-notes/{id}", h.DeleteClinicalNote)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"clinical-note-service"}`))
	})
	return mux
}
