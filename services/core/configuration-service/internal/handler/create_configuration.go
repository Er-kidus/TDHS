package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/configuration-service/internal/dto"
)

// CreateConfiguration handles POST requests to create a new configuration.
func (h *Handler) CreateConfiguration(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateConfigurationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateConfiguration(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
