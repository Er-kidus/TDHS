package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/logistics-service/internal/dto"
)

// UpdateLogistics handles PUT requests to update an existing logistics.
func (h *Handler) UpdateLogistics(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateLogisticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateLogistics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
