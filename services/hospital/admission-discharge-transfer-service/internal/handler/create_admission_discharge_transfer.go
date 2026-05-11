package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
)

// CreateAdmissionDischargeTransfer handles POST requests to create a new admission-discharge-transfer.
func (h *Handler) CreateAdmissionDischargeTransfer(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAdmissionDischargeTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAdmissionDischargeTransfer(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
