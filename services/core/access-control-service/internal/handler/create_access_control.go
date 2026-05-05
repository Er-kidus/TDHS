package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/access-control-service/internal/dto"
)

// CreateAccessControl handles POST requests to create a new access-control.
func (h *Handler) CreateAccessControl(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAccessControlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAccessControl(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
