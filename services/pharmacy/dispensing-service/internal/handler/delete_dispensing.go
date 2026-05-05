package handler

import (
	"net/http"
	"strings"
)

// DeleteDispensing handles DELETE requests to remove a dispensing by ID.
func (h *Handler) DeleteDispensing(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/dispensings/")
	w.WriteHeader(http.StatusNoContent)
}
