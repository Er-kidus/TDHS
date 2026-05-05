package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/inpatient-service/internal/dto"
)

// UpdateInpatient handles PUT requests to update an existing inpatient.
func (h *Handler) UpdateInpatient(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateInpatientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateInpatient(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
