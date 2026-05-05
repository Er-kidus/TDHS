package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/reporting-service/internal/dto"
)

// UpdateReporting handles PUT requests to update an existing reporting.
func (h *Handler) UpdateReporting(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateReportingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateReporting(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
