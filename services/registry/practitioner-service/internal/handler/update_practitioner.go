package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/practitioner-service/internal/dto"
)

// UpdatePractitioner handles PUT requests to update an existing practitioner.
func (h *Handler) UpdatePractitioner(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePractitionerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePractitioner(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
