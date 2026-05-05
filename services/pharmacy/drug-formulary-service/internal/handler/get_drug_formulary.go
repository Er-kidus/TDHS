package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDrugFormulary handles GET requests to retrieve a single drug-formulary by ID.
func (h *Handler) GetDrugFormulary(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/drug-formularys/")
	resp, err := h.svc.GetDrugFormulary(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
