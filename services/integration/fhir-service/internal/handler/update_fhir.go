package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/fhir-service/internal/dto"
)

// UpdateFhir handles PUT requests to update an existing fhir.
func (h *Handler) UpdateFhir(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateFhirRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateFhir(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
