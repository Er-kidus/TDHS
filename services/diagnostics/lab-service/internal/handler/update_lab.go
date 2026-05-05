package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/lab-service/internal/dto"
)

// UpdateLab handles PUT requests to update an existing lab.
func (h *Handler) UpdateLab(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateLabRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateLab(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
