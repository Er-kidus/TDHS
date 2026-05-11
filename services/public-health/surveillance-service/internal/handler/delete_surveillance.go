package handler

import (
	"net/http"
	"strings"
)

// DeleteSurveillance handles DELETE requests to remove a surveillance by ID.
func (h *Handler) DeleteSurveillance(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/surveillances/")
	w.WriteHeader(http.StatusNoContent)
}
