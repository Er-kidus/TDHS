package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/procurement-service/internal/dto"
)

// UpdateProcurement handles PUT requests to update an existing procurement.
func (h *Handler) UpdateProcurement(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProcurementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateProcurement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
