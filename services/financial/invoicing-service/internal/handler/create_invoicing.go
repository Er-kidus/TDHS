package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/invoicing-service/internal/dto"
)

// CreateInvoicing handles POST requests to create a new invoicing.
func (h *Handler) CreateInvoicing(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateInvoicingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateInvoicing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
