package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/program-service/internal/dto"
)

// UpdateProgram handles PUT requests to update an existing program.
func (h *Handler) UpdateProgram(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateProgram(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
