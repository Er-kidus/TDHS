package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/result-service/internal/dto"
)

// UpdateResult handles PUT requests to update an existing result.
func (h *Handler) UpdateResult(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateResult(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
