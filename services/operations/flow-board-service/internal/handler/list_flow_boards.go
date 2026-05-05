package handler

import (
	"encoding/json"
	"net/http"
)

// ListFlowBoards handles GET requests to list all flow-boards.
func (h *Handler) ListFlowBoards(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListFlowBoards(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
