package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/session-service/internal/dto"
)

// UpdateSession handles PUT requests to update an existing session.
func (h *Handler) UpdateSession(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateSession(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
