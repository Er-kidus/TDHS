package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/careplan-service/internal/dto"
)

// CreateCareplan handles POST requests to create a new careplan.
func (h *Handler) CreateCareplan(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCareplanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateCareplan(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
