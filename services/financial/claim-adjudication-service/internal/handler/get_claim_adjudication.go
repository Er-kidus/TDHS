package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetClaimAdjudication handles GET requests to retrieve a single claim-adjudication by ID.
func (h *Handler) GetClaimAdjudication(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/claim-adjudications/")
	resp, err := h.svc.GetClaimAdjudication(r.Context(), id)
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
