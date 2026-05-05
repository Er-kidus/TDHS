package handler

import (
	"encoding/json"
	"net/http"
)

// ListRadiologyWorkflows handles GET requests to list all radiology-workflows.
func (h *Handler) ListRadiologyWorkflows(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListRadiologyWorkflows(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
