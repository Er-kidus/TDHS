package repository

import (
	"context"
	"github.com/tenadam/appointment-service/internal/model"
)

// CreateAppointment inserts a new appointment record into the database.
func (r *Repository) CreateAppointment(ctx context.Context, entity *model.Appointment) (*model.Appointment, error) {
	return entity, nil
}
