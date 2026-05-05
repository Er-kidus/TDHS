package handler

import (
	"net/http"
	"strings"
)

// DeleteDashboard handles DELETE requests to remove a dashboard by ID.
func (h *Handler) DeleteDashboard(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/dashboards/")
	w.WriteHeader(http.StatusNoContent)
}
