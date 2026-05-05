package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/vendor-service/internal/dto"
)

// UpdateVendor handles PUT requests to update an existing vendor.
func (h *Handler) UpdateVendor(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateVendorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateVendor(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
