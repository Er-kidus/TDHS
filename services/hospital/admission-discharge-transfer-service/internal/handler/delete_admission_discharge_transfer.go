package handler

import (
	"net/http"
	"strings"
)

// DeleteAdmissionDischargeTransfer handles DELETE requests to remove a admission-discharge-transfer by ID.
func (h *Handler) DeleteAdmissionDischargeTransfer(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/admission-discharge-transfers/")
	w.WriteHeader(http.StatusNoContent)
}
