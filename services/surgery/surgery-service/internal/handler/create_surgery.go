package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/surgery-service/internal/dto"
)

// CreateSurgery handles POST requests to create a new surgery.
func (h *Handler) CreateSurgery(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSurgeryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateSurgery(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
