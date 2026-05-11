package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/post-operative-care-service/internal/dto"
)

// CreatePostOperativeCare handles POST requests to create a new post-operative-care.
func (h *Handler) CreatePostOperativeCare(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePostOperativeCareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePostOperativeCare(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
