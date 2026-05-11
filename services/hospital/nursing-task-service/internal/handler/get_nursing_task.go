package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetNursingTask handles GET requests to retrieve a single nursing-task by ID.
func (h *Handler) GetNursingTask(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/nursing-tasks/")
	resp, err := h.svc.GetNursingTask(r.Context(), id)
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
