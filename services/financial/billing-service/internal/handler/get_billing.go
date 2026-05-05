package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetBilling handles GET requests to retrieve a single billing by ID.
func (h *Handler) GetBilling(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/billings/")
	resp, err := h.svc.GetBilling(r.Context(), id)
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
