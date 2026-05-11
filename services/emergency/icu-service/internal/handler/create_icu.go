package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/icu-service/internal/dto"
)

// CreateIcu handles POST requests to create a new icu.
func (h *Handler) CreateIcu(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateIcuRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateIcu(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
