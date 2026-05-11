package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/post-operative-care-service/internal/handler"
	"github.com/tenadam/post-operative-care-service/internal/repository"
	"github.com/tenadam/post-operative-care-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /post-operative-cares", h.CreatePostOperativeCare)
	mux.HandleFunc("GET /post-operative-cares", h.ListPostOperativeCares)
	mux.HandleFunc("GET /post-operative-cares/{id}", h.GetPostOperativeCare)
	mux.HandleFunc("PUT /post-operative-cares/{id}", h.UpdatePostOperativeCare)
	mux.HandleFunc("DELETE /post-operative-cares/{id}", h.DeletePostOperativeCare)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"post-operative-care-service"}`))
	})
	return mux
}
