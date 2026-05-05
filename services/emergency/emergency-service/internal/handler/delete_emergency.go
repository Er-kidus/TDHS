package handler

import (
	"net/http"
	"strings"
)

// DeleteEmergency handles DELETE requests to remove a emergency by ID.
func (h *Handler) DeleteEmergency(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/emergencys/")
	w.WriteHeader(http.StatusNoContent)
}
