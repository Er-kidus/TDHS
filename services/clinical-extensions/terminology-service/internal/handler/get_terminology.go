package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTerminology handles GET requests to retrieve a single terminology by ID.
func (h *Handler) GetTerminology(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/terminologys/")
	resp, err := h.svc.GetTerminology(r.Context(), id)
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
