package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/form-service/internal/dto"
)

// UpdateForm handles PUT requests to update an existing form.
func (h *Handler) UpdateForm(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateFormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateForm(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
