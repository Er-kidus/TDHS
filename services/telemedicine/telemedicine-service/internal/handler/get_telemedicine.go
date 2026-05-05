package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTelemedicine handles GET requests to retrieve a single telemedicine by ID.
func (h *Handler) GetTelemedicine(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/telemedicines/")
	resp, err := h.svc.GetTelemedicine(r.Context(), id)
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
