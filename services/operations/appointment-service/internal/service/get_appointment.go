package service

import (
	"context"
	"github.com/tenadam/appointment-service/internal/dto"
)

// GetAppointment retrieves a single appointment by ID.
func (s *Service) GetAppointment(ctx context.Context, id string) (*dto.AppointmentResponse, error) {
	entity, err := s.repo.GetAppointment(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AppointmentResponse{ID: entity.ID}, nil
}
