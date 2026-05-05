package handler

import (
	"net/http"
	"strings"
)

// DeleteDrugFormulary handles DELETE requests to remove a drug-formulary by ID.
func (h *Handler) DeleteDrugFormulary(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/drug-formularys/")
	w.WriteHeader(http.StatusNoContent)
}
