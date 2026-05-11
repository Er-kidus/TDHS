package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/event-bus-service/internal/dto"
)

// UpdateEventBus handles PUT requests to update an existing event-bus.
func (h *Handler) UpdateEventBus(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateEventBusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateEventBus(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
