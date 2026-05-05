package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/logistics-service/internal/dto"
)

// CreateLogistics handles POST requests to create a new logistics.
func (h *Handler) CreateLogistics(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateLogisticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateLogistics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
