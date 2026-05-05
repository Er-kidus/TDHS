package handler

import (
	"net/http"

	"github.com/tenadam/api-gateway/internal/repository"
)

type updatePatientRequest struct {
	FullName string         `json:"full_name"`
	Email    string         `json:"email"`
	Phone    string         `json:"phone"`
	Profile  map[string]any `json:"profile"`
}

func (h *Handler) GetPatientMe(w http.ResponseWriter, r *http.Request) {
	id := subjectID(r.Context())
	patient, err := h.svcs.Patients.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "patient not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load patient")
		return
	}
	h.writeJSON(w, http.StatusOK, patient)
}

func (h *Handler) UpdatePatientMe(w http.ResponseWriter, r *http.Request) {
	id := subjectID(r.Context())
	var req updatePatientRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Profile == nil {
		req.Profile = map[string]any{}
	}
	updated, err := h.svcs.Patients.UpdateProfileMerge(r.Context(), id, req.FullName, req.Email, req.Phone, req.Profile)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "patient not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update patient")
		return
	}
	h.writeJSON(w, http.StatusOK, updated)
}
