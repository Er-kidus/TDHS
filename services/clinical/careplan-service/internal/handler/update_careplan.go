package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/careplan-service/internal/dto"
)

// UpdateCareplan handles PUT requests to update an existing careplan.
func (h *Handler) UpdateCareplan(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateCareplanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateCareplan(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
