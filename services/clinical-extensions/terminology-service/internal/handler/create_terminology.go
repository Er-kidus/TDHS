package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/terminology-service/internal/dto"
)

// CreateTerminology handles POST requests to create a new terminology.
func (h *Handler) CreateTerminology(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTerminologyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateTerminology(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
