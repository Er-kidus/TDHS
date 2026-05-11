package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAdmissionDischargeTransfer handles GET requests to retrieve a single admission-discharge-transfer by ID.
func (h *Handler) GetAdmissionDischargeTransfer(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/admission-discharge-transfers/")
	resp, err := h.svc.GetAdmissionDischargeTransfer(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
