package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/nursing-task-service/internal/handler"
	"github.com/tenadam/nursing-task-service/internal/repository"
	"github.com/tenadam/nursing-task-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /nursing-tasks", h.CreateNursingTask)
	mux.HandleFunc("GET /nursing-tasks", h.ListNursingTasks)
	mux.HandleFunc("GET /nursing-tasks/{id}", h.GetNursingTask)
	mux.HandleFunc("PUT /nursing-tasks/{id}", h.UpdateNursingTask)
	mux.HandleFunc("DELETE /nursing-tasks/{id}", h.DeleteNursingTask)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"nursing-task-service"}`))
	})
	return mux
}
