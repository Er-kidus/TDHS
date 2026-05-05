package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/interoperability-service/internal/dto"
)

// UpdateInteroperability handles PUT requests to update an existing interoperability.
func (h *Handler) UpdateInteroperability(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateInteroperabilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateInteroperability(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
