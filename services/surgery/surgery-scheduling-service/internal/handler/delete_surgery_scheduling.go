package handler

import (
	"net/http"
	"strings"
)

// DeleteSurgeryScheduling handles DELETE requests to remove a surgery-scheduling by ID.
func (h *Handler) DeleteSurgeryScheduling(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/surgery-schedulings/")
	w.WriteHeader(http.StatusNoContent)
}
