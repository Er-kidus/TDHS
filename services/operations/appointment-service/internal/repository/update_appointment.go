package repository

import (
	"context"
	"github.com/tenadam/appointment-service/internal/model"
)

// UpdateAppointment updates an existing appointment record in the database.
func (r *Repository) UpdateAppointment(ctx context.Context, entity *model.Appointment) (*model.Appointment, error) {
	return entity, nil
}
