package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
)

// UpdateSurgeryScheduling handles PUT requests to update an existing surgery-scheduling.
func (h *Handler) UpdateSurgeryScheduling(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSurgerySchedulingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateSurgeryScheduling(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
