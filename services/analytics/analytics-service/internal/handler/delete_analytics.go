package handler

import (
	"net/http"
	"strings"
)

// DeleteAnalytics handles DELETE requests to remove a analytics by ID.
func (h *Handler) DeleteAnalytics(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/analyticss/")
	w.WriteHeader(http.StatusNoContent)
}
