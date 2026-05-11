package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/flow-board-service/internal/handler"
	"github.com/tenadam/flow-board-service/internal/repository"
	"github.com/tenadam/flow-board-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /flow-boards", h.CreateFlowBoard)
	mux.HandleFunc("GET /flow-boards", h.ListFlowBoards)
	mux.HandleFunc("GET /flow-boards/{id}", h.GetFlowBoard)
	mux.HandleFunc("PUT /flow-boards/{id}", h.UpdateFlowBoard)
	mux.HandleFunc("DELETE /flow-boards/{id}", h.DeleteFlowBoard)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"flow-board-service"}`))
	})
	return mux
}
