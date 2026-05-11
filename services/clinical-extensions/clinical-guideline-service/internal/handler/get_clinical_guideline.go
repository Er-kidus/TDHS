package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetClinicalGuideline handles GET requests to retrieve a single clinical-guideline by ID.
func (h *Handler) GetClinicalGuideline(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/clinical-guidelines/")
	resp, err := h.svc.GetClinicalGuideline(r.Context(), id)
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
