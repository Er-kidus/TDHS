package handler

import "github.com/tenadam/practitioner-service/internal/service"

// Handler holds dependencies for HTTP request handling.
type Handler struct {
	svc *service.Service
}

// New creates a new Handler.
func New(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}
