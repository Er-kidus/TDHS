package handler

import (
	"encoding/json"
	"net/http"
)

// ListDocuments handles GET requests to list all documents.
func (h *Handler) ListDocuments(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDocuments(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
