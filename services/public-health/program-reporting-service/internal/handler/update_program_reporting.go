package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/program-reporting-service/internal/dto"
)

// UpdateProgramReporting handles PUT requests to update an existing program-reporting.
func (h *Handler) UpdateProgramReporting(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProgramReportingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateProgramReporting(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
