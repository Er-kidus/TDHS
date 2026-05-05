package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetEmergency handles GET requests to retrieve a single emergency by ID.
func (h *Handler) GetEmergency(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/emergencys/")
	resp, err := h.svc.GetEmergency(r.Context(), id)
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
