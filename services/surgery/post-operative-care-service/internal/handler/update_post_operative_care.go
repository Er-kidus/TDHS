package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/post-operative-care-service/internal/dto"
)

// UpdatePostOperativeCare handles PUT requests to update an existing post-operative-care.
func (h *Handler) UpdatePostOperativeCare(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePostOperativeCareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePostOperativeCare(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
