package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/reporting-service/internal/dto"
)

// CreateReporting handles POST requests to create a new reporting.
func (h *Handler) CreateReporting(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateReportingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateReporting(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
