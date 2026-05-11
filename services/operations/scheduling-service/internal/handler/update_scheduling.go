package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/scheduling-service/internal/dto"
)

// UpdateScheduling handles PUT requests to update an existing scheduling.
func (h *Handler) UpdateScheduling(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSchedulingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateScheduling(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
