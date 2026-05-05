package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/configuration-service/internal/dto"
)

// UpdateConfiguration handles PUT requests to update an existing configuration.
func (h *Handler) UpdateConfiguration(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateConfigurationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateConfiguration(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
