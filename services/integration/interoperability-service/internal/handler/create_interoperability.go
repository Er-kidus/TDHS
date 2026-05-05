package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/interoperability-service/internal/dto"
)

// CreateInteroperability handles POST requests to create a new interoperability.
func (h *Handler) CreateInteroperability(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateInteroperabilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateInteroperability(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
