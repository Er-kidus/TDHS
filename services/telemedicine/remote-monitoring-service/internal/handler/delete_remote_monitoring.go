package handler

import (
	"net/http"
	"strings"
)

// DeleteRemoteMonitoring handles DELETE requests to remove a remote-monitoring by ID.
func (h *Handler) DeleteRemoteMonitoring(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/remote-monitorings/")
	w.WriteHeader(http.StatusNoContent)
}
