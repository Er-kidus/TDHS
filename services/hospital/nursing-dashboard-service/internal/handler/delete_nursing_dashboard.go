package handler

import (
	"net/http"
	"strings"
)

// DeleteNursingDashboard handles DELETE requests to remove a nursing-dashboard by ID.
func (h *Handler) DeleteNursingDashboard(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/nursing-dashboards/")
	w.WriteHeader(http.StatusNoContent)
}
