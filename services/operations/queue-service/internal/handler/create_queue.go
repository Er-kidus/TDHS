package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/queue-service/internal/dto"
)

// CreateQueue handles POST requests to create a new queue.
func (h *Handler) CreateQueue(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateQueueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateQueue(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
