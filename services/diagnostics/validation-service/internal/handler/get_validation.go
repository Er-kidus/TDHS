package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetValidation handles GET requests to retrieve a single validation by ID.
func (h *Handler) GetValidation(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/validations/")
	resp, err := h.svc.GetValidation(r.Context(), id)
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
