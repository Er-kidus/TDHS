package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/triage-service/internal/dto"
)

// UpdateTriage handles PUT requests to update an existing triage.
func (h *Handler) UpdateTriage(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateTriageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateTriage(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
