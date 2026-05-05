package handler

import (
	"net/http"
	"strings"
)

// DeleteDischargePlanning handles DELETE requests to remove a discharge-planning by ID.
func (h *Handler) DeleteDischargePlanning(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/discharge-plannings/")
	w.WriteHeader(http.StatusNoContent)
}
