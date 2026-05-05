package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/clinical-data-service/internal/handler"
	"github.com/tenadam/clinical-data-service/internal/repository"
	"github.com/tenadam/clinical-data-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /clinical-datas", h.CreateClinicalData)
	mux.HandleFunc("GET /clinical-datas", h.ListClinicalDatas)
	mux.HandleFunc("GET /clinical-datas/{id}", h.GetClinicalData)
	mux.HandleFunc("PUT /clinical-datas/{id}", h.UpdateClinicalData)
	mux.HandleFunc("DELETE /clinical-datas/{id}", h.DeleteClinicalData)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"clinical-data-service"}`))
	})
	return mux
}
