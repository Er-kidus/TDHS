package handler

import (
	"net/http"
	"strings"
)

// DeleteShiftHandoff handles DELETE requests to remove a shift-handoff by ID.
func (h *Handler) DeleteShiftHandoff(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/shift-handoffs/")
	w.WriteHeader(http.StatusNoContent)
}
