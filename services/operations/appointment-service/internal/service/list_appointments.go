package service

import (
	"context"
	"github.com/tenadam/appointment-service/internal/dto"
)

// ListAppointments retrieves all appointments.
func (s *Service) ListAppointments(ctx context.Context) (*dto.ListAppointmentResponse, error) {
	entities, err := s.repo.ListAppointments(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AppointmentResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AppointmentResponse{ID: e.ID})
	}
	return &dto.ListAppointmentResponse{Items: items, Total: len(items)}, nil
}
