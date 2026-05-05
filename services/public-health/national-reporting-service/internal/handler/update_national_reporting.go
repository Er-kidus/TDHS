package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/national-reporting-service/internal/dto"
)

// UpdateNationalReporting handles PUT requests to update an existing national-reporting.
func (h *Handler) UpdateNationalReporting(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateNationalReportingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateNationalReporting(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
