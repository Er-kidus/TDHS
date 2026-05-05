package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/procurement-service/internal/dto"
)

// CreateProcurement handles POST requests to create a new procurement.
func (h *Handler) CreateProcurement(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateProcurementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateProcurement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
