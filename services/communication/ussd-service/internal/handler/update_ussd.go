package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/ussd-service/internal/dto"
)

// UpdateUssd handles PUT requests to update an existing ussd.
func (h *Handler) UpdateUssd(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateUssdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateUssd(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
