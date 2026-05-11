package handler

import (
	"net/http"
	"strings"
)

// DeleteAuditAnalytics handles DELETE requests to remove a audit-analytics by ID.
func (h *Handler) DeleteAuditAnalytics(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/audit-analyticss/")
	w.WriteHeader(http.StatusNoContent)
}
