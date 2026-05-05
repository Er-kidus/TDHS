package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetShiftHandoff handles GET requests to retrieve a single shift-handoff by ID.
func (h *Handler) GetShiftHandoff(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/shift-handoffs/")
	resp, err := h.svc.GetShiftHandoff(r.Context(), id)
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
