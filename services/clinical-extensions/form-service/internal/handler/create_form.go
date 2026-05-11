package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/form-service/internal/dto"
)

// CreateForm handles POST requests to create a new form.
func (h *Handler) CreateForm(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateForm(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
