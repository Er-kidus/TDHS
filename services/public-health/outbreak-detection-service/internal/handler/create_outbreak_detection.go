package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
)

// CreateOutbreakDetection handles POST requests to create a new outbreak-detection.
func (h *Handler) CreateOutbreakDetection(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOutbreakDetectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateOutbreakDetection(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
