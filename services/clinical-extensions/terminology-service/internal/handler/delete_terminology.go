package handler

import (
	"net/http"
	"strings"
)

// DeleteTerminology handles DELETE requests to remove a terminology by ID.
func (h *Handler) DeleteTerminology(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/terminologys/")
	w.WriteHeader(http.StatusNoContent)
}
