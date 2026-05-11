package handler

import (
	"encoding/json"
	"net/http"
)

// ListLabWorkflows handles GET requests to list all lab-workflows.
func (h *Handler) ListLabWorkflows(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListLabWorkflows(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
