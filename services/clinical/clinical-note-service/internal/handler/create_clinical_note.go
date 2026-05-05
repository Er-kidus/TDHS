package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/clinical-note-service/internal/dto"
)

// CreateClinicalNote handles POST requests to create a new clinical-note.
func (h *Handler) CreateClinicalNote(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateClinicalNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateClinicalNote(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
