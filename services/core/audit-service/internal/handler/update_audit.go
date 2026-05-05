package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/audit-service/internal/dto"
)

// UpdateAudit handles PUT requests to update an existing audit.
func (h *Handler) UpdateAudit(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAuditRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAudit(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
