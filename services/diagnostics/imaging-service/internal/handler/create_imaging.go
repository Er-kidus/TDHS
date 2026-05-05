package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/imaging-service/internal/dto"
)

// CreateImaging handles POST requests to create a new imaging.
func (h *Handler) CreateImaging(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateImagingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateImaging(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
