package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/dispensing-service/internal/dto"
)

// UpdateDispensing handles PUT requests to update an existing dispensing.
func (h *Handler) UpdateDispensing(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDispensingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDispensing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
