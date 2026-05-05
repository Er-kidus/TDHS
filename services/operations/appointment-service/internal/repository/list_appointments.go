package repository

import (
	"context"
	"github.com/tenadam/appointment-service/internal/model"
)

// ListAppointments retrieves all appointment records.
func (r *Repository) ListAppointments(ctx context.Context) ([]*model.Appointment, error) {
	return nil, nil
}
