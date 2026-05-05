package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/data-quality-service/internal/dto"
)

// UpdateDataQuality handles PUT requests to update an existing data-quality.
func (h *Handler) UpdateDataQuality(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDataQualityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDataQuality(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
