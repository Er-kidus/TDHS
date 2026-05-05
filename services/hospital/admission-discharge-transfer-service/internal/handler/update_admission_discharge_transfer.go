package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
)

// UpdateAdmissionDischargeTransfer handles PUT requests to update an existing admission-discharge-transfer.
func (h *Handler) UpdateAdmissionDischargeTransfer(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAdmissionDischargeTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAdmissionDischargeTransfer(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
