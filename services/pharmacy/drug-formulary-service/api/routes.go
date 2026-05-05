package api

import (
	"database/sql"
	"net/http"

	"github.com/tenadam/drug-formulary-service/internal/handler"
	"github.com/tenadam/drug-formulary-service/internal/repository"
	"github.com/tenadam/drug-formulary-service/internal/service"
)

// NewRouter wires together all layers and returns the HTTP router.
// db may be nil during testing; inject a real *sql.DB in production.
func NewRouter(db *sql.DB) http.Handler {
	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /drug-formularys", h.CreateDrugFormulary)
	mux.HandleFunc("GET /drug-formularys", h.ListDrugFormularys)
	mux.HandleFunc("GET /drug-formularys/{id}", h.GetDrugFormulary)
	mux.HandleFunc("PUT /drug-formularys/{id}", h.UpdateDrugFormulary)
	mux.HandleFunc("DELETE /drug-formularys/{id}", h.DeleteDrugFormulary)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"drug-formulary-service"}`))
	})
	return mux
}
