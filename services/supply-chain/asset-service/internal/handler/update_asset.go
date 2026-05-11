package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/asset-service/internal/dto"
)

// UpdateAsset handles PUT requests to update an existing asset.
func (h *Handler) UpdateAsset(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAssetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAsset(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
