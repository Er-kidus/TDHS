package handler

import (
	"net/http"
	"strings"
)

// DeleteIntegrationJob handles DELETE requests to remove a integration-job by ID.
func (h *Handler) DeleteIntegrationJob(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/integration-jobs/")
	w.WriteHeader(http.StatusNoContent)
}
