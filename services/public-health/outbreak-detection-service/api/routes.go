package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/outbreak-detection-service/internal/handler"
	"github.com/tenadam/outbreak-detection-service/internal/repository"
	"github.com/tenadam/outbreak-detection-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /outbreak-detections", h.CreateOutbreakDetection)
	mux.HandleFunc("GET /outbreak-detections", h.ListOutbreakDetections)
	mux.HandleFunc("GET /outbreak-detections/{id}", h.GetOutbreakDetection)
	mux.HandleFunc("PUT /outbreak-detections/{id}", h.UpdateOutbreakDetection)
	mux.HandleFunc("DELETE /outbreak-detections/{id}", h.DeleteOutbreakDetection)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"outbreak-detection-service"}`))
	})
	return mux
}
