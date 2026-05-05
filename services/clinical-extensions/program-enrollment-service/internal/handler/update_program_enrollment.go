package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/program-enrollment-service/internal/dto"
)

// UpdateProgramEnrollment handles PUT requests to update an existing program-enrollment.
func (h *Handler) UpdateProgramEnrollment(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateProgramEnrollmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateProgramEnrollment(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
