package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/referral-service/internal/dto"
)

// UpdateReferral handles PUT requests to update an existing referral.
func (h *Handler) UpdateReferral(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateReferralRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateReferral(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
