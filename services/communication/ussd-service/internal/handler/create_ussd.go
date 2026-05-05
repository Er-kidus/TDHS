package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/ussd-service/internal/dto"
)

// CreateUssd handles POST requests to create a new ussd.
func (h *Handler) CreateUssd(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUssdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateUssd(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
