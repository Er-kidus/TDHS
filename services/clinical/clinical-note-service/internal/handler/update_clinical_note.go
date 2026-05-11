package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/clinical-note-service/internal/dto"
)

// UpdateClinicalNote handles PUT requests to update an existing clinical-note.
func (h *Handler) UpdateClinicalNote(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateClinicalNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateClinicalNote(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
