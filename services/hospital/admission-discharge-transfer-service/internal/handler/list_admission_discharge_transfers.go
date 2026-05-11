package handler

import (
	"encoding/json"
	"net/http"
)

// ListAdmissionDischargeTransfers handles GET requests to list all admission-discharge-transfers.
func (h *Handler) ListAdmissionDischargeTransfers(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAdmissionDischargeTransfers(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
