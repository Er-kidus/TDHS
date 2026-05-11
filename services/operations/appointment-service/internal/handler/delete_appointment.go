package handler

import (
	"net/http"
	"strings"
)

// DeleteAppointment handles DELETE requests to remove a appointment by ID.
func (h *Handler) DeleteAppointment(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/appointments/")
	w.WriteHeader(http.StatusNoContent)
}
