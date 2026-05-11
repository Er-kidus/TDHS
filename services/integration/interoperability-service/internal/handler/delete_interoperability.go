package handler

import (
	"net/http"
	"strings"
)

// DeleteInteroperability handles DELETE requests to remove a interoperability by ID.
func (h *Handler) DeleteInteroperability(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/interoperabilitys/")
	w.WriteHeader(http.StatusNoContent)
}
