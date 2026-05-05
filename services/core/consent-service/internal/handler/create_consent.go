package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/consent-service/internal/dto"
)

// CreateConsent handles POST requests to create a new consent.
func (h *Handler) CreateConsent(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateConsentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateConsent(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
