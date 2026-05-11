package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/procedure-service/internal/dto"
)

// CreateProcedure handles POST requests to create a new procedure.
func (h *Handler) CreateProcedure(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateProcedureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateProcedure(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
