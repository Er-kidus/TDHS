package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/program-service/internal/dto"
)

// CreateProgram handles POST requests to create a new program.
func (h *Handler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateProgram(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
