package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
)

// CreateClaimAdjudication handles POST requests to create a new claim-adjudication.
func (h *Handler) CreateClaimAdjudication(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateClaimAdjudicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateClaimAdjudication(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
