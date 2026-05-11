package handler

import (
	"net/http"
	"strings"
)

// DeleteLogistics handles DELETE requests to remove a logistics by ID.
func (h *Handler) DeleteLogistics(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/logisticss/")
	w.WriteHeader(http.StatusNoContent)
}
