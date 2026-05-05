package handler

import (
	"net/http"
)

func (h *Handler) GetPatientDashboard(w http.ResponseWriter, r *http.Request) {

	patientID := subjectID(r.Context())

	data, err := h.svcs.PatientDashboard.Get(r.Context(), patientID)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to load dashboard")
		return
	}

	h.writeJSON(w, http.StatusOK, data)
}