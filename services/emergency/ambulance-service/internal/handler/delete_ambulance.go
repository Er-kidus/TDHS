package handler

import (
	"net/http"
	"strings"
)

// DeleteAmbulance handles DELETE requests to remove a ambulance by ID.
func (h *Handler) DeleteAmbulance(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/ambulances/")
	w.WriteHeader(http.StatusNoContent)
}
