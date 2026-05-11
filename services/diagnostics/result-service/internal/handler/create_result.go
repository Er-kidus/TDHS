package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/result-service/internal/dto"
)

// CreateResult handles POST requests to create a new result.
func (h *Handler) CreateResult(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateResult(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
