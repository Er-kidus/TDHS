package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/consent-service/internal/dto"
)

// UpdateConsent handles PUT requests to update an existing consent.
func (h *Handler) UpdateConsent(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateConsentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateConsent(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
