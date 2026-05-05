package handler

import (
	"encoding/json"
	"net/http"
)

// ListNursingTasks handles GET requests to list all nursing-tasks.
func (h *Handler) ListNursingTasks(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListNursingTasks(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
