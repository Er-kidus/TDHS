package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/messaging-service/internal/handler"
	"github.com/tenadam/messaging-service/internal/repository"
	"github.com/tenadam/messaging-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /messagings", h.CreateMessaging)
	mux.HandleFunc("GET /messagings", h.ListMessagings)
	mux.HandleFunc("GET /messagings/{id}", h.GetMessaging)
	mux.HandleFunc("PUT /messagings/{id}", h.UpdateMessaging)
	mux.HandleFunc("DELETE /messagings/{id}", h.DeleteMessaging)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"messaging-service"}`))
	})
	return mux
}
