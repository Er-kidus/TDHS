package service

import (
	"context"
	"github.com/tenadam/appointment-service/internal/dto"
	"github.com/tenadam/appointment-service/internal/model"
	"github.com/tenadam/appointment-service/internal/validator"
)

// UpdateAppointment validates and updates an existing appointment.
func (s *Service) UpdateAppointment(ctx context.Context, req dto.UpdateAppointmentRequest) (*dto.AppointmentResponse, error) {
	if err := validator.ValidateAppointmentUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Appointment{ID: req.ID}
	updated, err := s.repo.UpdateAppointment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AppointmentResponse{ID: updated.ID}, nil
}
