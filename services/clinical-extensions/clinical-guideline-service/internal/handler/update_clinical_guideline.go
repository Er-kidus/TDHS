package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
)

// UpdateClinicalGuideline handles PUT requests to update an existing clinical-guideline.
func (h *Handler) UpdateClinicalGuideline(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateClinicalGuidelineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateClinicalGuideline(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
