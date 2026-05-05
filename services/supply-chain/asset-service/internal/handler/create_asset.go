package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/asset-service/internal/dto"
)

// CreateAsset handles POST requests to create a new asset.
func (h *Handler) CreateAsset(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAssetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAsset(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
