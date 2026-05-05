package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/document-service/internal/handler"
	"github.com/tenadam/document-service/internal/repository"
	"github.com/tenadam/document-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /documents", h.CreateDocument)
	mux.HandleFunc("GET /documents", h.ListDocuments)
	mux.HandleFunc("GET /documents/{id}", h.GetDocument)
	mux.HandleFunc("PUT /documents/{id}", h.UpdateDocument)
	mux.HandleFunc("DELETE /documents/{id}", h.DeleteDocument)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"document-service"}`))
	})
	return mux
}
