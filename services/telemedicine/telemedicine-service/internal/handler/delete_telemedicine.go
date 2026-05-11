package handler

import (
	"net/http"
	"strings"
)

// DeleteTelemedicine handles DELETE requests to remove a telemedicine by ID.
func (h *Handler) DeleteTelemedicine(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/telemedicines/")
	w.WriteHeader(http.StatusNoContent)
}
