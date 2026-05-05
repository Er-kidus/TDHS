package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetClinicalNote handles GET requests to retrieve a single clinical-note by ID.
func (h *Handler) GetClinicalNote(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/clinical-notes/")
	resp, err := h.svc.GetClinicalNote(r.Context(), id)
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
