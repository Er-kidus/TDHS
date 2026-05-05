package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetEventBus handles GET requests to retrieve a single event-bus by ID.
func (h *Handler) GetEventBus(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/event-buss/")
	resp, err := h.svc.GetEventBus(r.Context(), id)
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
