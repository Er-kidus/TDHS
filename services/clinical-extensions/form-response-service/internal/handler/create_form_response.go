package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/form-response-service/internal/dto"
)

// CreateFormResponse handles POST requests to create a new form-response.
func (h *Handler) CreateFormResponse(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFormResponseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateFormResponse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
