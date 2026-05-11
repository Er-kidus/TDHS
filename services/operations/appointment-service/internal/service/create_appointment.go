package service

import (
	"context"
	"github.com/tenadam/appointment-service/internal/dto"
	"github.com/tenadam/appointment-service/internal/model"
	"github.com/tenadam/appointment-service/internal/validator"
)

// CreateAppointment validates and creates a new appointment.
func (s *Service) CreateAppointment(ctx context.Context, req dto.CreateAppointmentRequest) (*dto.AppointmentResponse, error) {
	if err := validator.ValidateAppointmentCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Appointment{}
	created, err := s.repo.CreateAppointment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AppointmentResponse{ID: created.ID}, nil
}
