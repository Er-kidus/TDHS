package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/data-quality-service/internal/dto"
)

// CreateDataQuality handles POST requests to create a new data-quality.
func (h *Handler) CreateDataQuality(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDataQualityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDataQuality(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
