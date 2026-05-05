package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/invoicing-service/internal/dto"
)

// UpdateInvoicing handles PUT requests to update an existing invoicing.
func (h *Handler) UpdateInvoicing(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateInvoicingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateInvoicing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
