package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/dispensing-service/internal/dto"
)

// CreateDispensing handles POST requests to create a new dispensing.
func (h *Handler) CreateDispensing(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDispensingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDispensing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
