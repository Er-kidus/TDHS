package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/surgery-service/internal/dto"
)

// UpdateSurgery handles PUT requests to update an existing surgery.
func (h *Handler) UpdateSurgery(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSurgeryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateSurgery(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
