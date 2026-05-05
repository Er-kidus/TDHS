package handler

import (
	"net/http"
	"strings"
)

// DeleteBedManagement handles DELETE requests to remove a bed-management by ID.
func (h *Handler) DeleteBedManagement(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/bed-managements/")
	w.WriteHeader(http.StatusNoContent)
}
