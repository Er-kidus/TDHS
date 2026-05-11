package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/terminology-service/internal/dto"
)

// UpdateTerminology handles PUT requests to update an existing terminology.
func (h *Handler) UpdateTerminology(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateTerminologyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateTerminology(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
