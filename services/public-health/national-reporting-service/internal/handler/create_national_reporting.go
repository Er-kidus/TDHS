package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/national-reporting-service/internal/dto"
)

// CreateNationalReporting handles POST requests to create a new national-reporting.
func (h *Handler) CreateNationalReporting(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateNationalReportingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateNationalReporting(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
