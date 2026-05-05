package handler

import (
	"encoding/json"
	"net/http"
)

// ListProcedures handles GET requests to list all procedures.
func (h *Handler) ListProcedures(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListProcedures(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
