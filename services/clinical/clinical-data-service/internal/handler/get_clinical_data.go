package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetClinicalData handles GET requests to retrieve a single clinical-data by ID.
func (h *Handler) GetClinicalData(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/clinical-datas/")
	resp, err := h.svc.GetClinicalData(r.Context(), id)
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
