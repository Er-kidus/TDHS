package handler

import (
	"encoding/json"
	"net/http"
)

// ListClinicalNotes handles GET requests to list all clinical-notes.
func (h *Handler) ListClinicalNotes(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListClinicalNotes(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
