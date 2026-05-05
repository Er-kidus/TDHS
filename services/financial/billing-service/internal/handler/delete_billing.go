package handler

import (
	"net/http"
	"strings"
)

// DeleteBilling handles DELETE requests to remove a billing by ID.
func (h *Handler) DeleteBilling(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/billings/")
	w.WriteHeader(http.StatusNoContent)
}
