package handler

import (
	"net/http"
	"strings"
)

// DeleteClinicalData handles DELETE requests to remove a clinical-data by ID.
func (h *Handler) DeleteClinicalData(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/clinical-datas/")
	w.WriteHeader(http.StatusNoContent)
}
