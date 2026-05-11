package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/lab-service/internal/dto"
)

// CreateLab handles POST requests to create a new lab.
func (h *Handler) CreateLab(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateLabRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateLab(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
