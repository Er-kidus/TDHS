package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetProcedure handles GET requests to retrieve a single procedure by ID.
func (h *Handler) GetProcedure(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/procedures/")
	resp, err := h.svc.GetProcedure(r.Context(), id)
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
