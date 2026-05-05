package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/procedure-service/internal/dto"
)

// UpdateProcedure handles PUT requests to update an existing procedure.
func (h *Handler) UpdateProcedure(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProcedureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateProcedure(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
