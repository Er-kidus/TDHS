package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetFlowBoard handles GET requests to retrieve a single flow-board by ID.
func (h *Handler) GetFlowBoard(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/flow-boards/")
	resp, err := h.svc.GetFlowBoard(r.Context(), id)
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
