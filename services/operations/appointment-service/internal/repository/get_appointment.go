package repository

import (
	"context"
	"github.com/tenadam/appointment-service/internal/model"
)

// GetAppointment retrieves a single appointment record by ID.
func (r *Repository) GetAppointment(ctx context.Context, id string) (*model.Appointment, error) {
	return nil, nil
}
