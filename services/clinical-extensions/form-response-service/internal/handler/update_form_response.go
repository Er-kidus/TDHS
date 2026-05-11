package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/form-response-service/internal/dto"
)

// UpdateFormResponse handles PUT requests to update an existing form-response.
func (h *Handler) UpdateFormResponse(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateFormResponseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateFormResponse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
