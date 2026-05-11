package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/check-in-service/internal/dto"
)

// UpdateCheckIn handles PUT requests to update an existing check-in.
func (h *Handler) UpdateCheckIn(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateCheckInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateCheckIn(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
