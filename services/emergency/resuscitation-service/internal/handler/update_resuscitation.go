package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/resuscitation-service/internal/dto"
)

// UpdateResuscitation handles PUT requests to update an existing resuscitation.
func (h *Handler) UpdateResuscitation(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateResuscitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateResuscitation(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
