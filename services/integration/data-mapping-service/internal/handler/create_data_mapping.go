package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/data-mapping-service/internal/dto"
)

// CreateDataMapping handles POST requests to create a new data-mapping.
func (h *Handler) CreateDataMapping(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDataMappingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDataMapping(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
