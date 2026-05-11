package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetNursing handles GET requests to retrieve a single nursing by ID.
func (h *Handler) GetNursing(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/nursings/")
	resp, err := h.svc.GetNursing(r.Context(), id)
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
