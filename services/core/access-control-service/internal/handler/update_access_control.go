package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/access-control-service/internal/dto"
)

// UpdateAccessControl handles PUT requests to update an existing access-control.
func (h *Handler) UpdateAccessControl(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAccessControlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAccessControl(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
