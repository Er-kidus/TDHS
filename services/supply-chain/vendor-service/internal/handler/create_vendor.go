package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/vendor-service/internal/dto"
)

// CreateVendor handles POST requests to create a new vendor.
func (h *Handler) CreateVendor(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateVendorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateVendor(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
