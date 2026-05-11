package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
)

// UpdateOutbreakDetection handles PUT requests to update an existing outbreak-detection.
func (h *Handler) UpdateOutbreakDetection(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateOutbreakDetectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateOutbreakDetection(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
