package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/fhir-service/internal/dto"
)

// CreateFhir handles POST requests to create a new fhir.
func (h *Handler) CreateFhir(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFhirRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateFhir(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
