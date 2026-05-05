package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPayment handles GET requests to retrieve a single payment by ID.
func (h *Handler) GetPayment(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/payments/")
	resp, err := h.svc.GetPayment(r.Context(), id)
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
