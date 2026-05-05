package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/notification-service/internal/handler"
	"github.com/tenadam/notification-service/internal/repository"
	"github.com/tenadam/notification-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /notifications", h.CreateNotification)
	mux.HandleFunc("GET /notifications", h.ListNotifications)
	mux.HandleFunc("GET /notifications/{id}", h.GetNotification)
	mux.HandleFunc("PUT /notifications/{id}", h.UpdateNotification)
	mux.HandleFunc("DELETE /notifications/{id}", h.DeleteNotification)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"notification-service"}`))
	})
	return mux
}
