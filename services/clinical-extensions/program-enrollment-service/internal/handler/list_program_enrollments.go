package handler

import (
	"encoding/json"
	"net/http"
)

// ListProgramEnrollments handles GET requests to list all program-enrollments.
func (h *Handler) ListProgramEnrollments(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListProgramEnrollments(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
