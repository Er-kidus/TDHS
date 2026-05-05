package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
)

// UpdateClaimAdjudication handles PUT requests to update an existing claim-adjudication.
func (h *Handler) UpdateClaimAdjudication(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateClaimAdjudicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateClaimAdjudication(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
