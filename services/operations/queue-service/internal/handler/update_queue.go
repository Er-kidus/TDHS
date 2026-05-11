package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/queue-service/internal/dto"
)

// UpdateQueue handles PUT requests to update an existing queue.
func (h *Handler) UpdateQueue(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateQueueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateQueue(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
