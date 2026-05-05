package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/inpatient-service/internal/dto"
)

// CreateInpatient handles POST requests to create a new inpatient.
func (h *Handler) CreateInpatient(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateInpatientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateInpatient(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
