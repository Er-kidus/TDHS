package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/identifier-service/internal/dto"
)

// UpdateIdentifier handles PUT requests to update an existing identifier.
func (h *Handler) UpdateIdentifier(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateIdentifierRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateIdentifier(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
