package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/resuscitation-service/internal/dto"
)

// CreateResuscitation handles POST requests to create a new resuscitation.
func (h *Handler) CreateResuscitation(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateResuscitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateResuscitation(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
