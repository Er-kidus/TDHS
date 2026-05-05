package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetInpatient handles GET requests to retrieve a single inpatient by ID.
func (h *Handler) GetInpatient(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/inpatients/")
	resp, err := h.svc.GetInpatient(r.Context(), id)
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
