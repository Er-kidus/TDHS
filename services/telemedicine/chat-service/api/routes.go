package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/chat-service/internal/handler"
	"github.com/tenadam/chat-service/internal/repository"
	"github.com/tenadam/chat-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /chats", h.CreateChat)
	mux.HandleFunc("GET /chats", h.ListChats)
	mux.HandleFunc("GET /chats/{id}", h.GetChat)
	mux.HandleFunc("PUT /chats/{id}", h.UpdateChat)
	mux.HandleFunc("DELETE /chats/{id}", h.DeleteChat)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"chat-service"}`))
	})
	return mux
}
