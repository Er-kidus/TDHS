package repository

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/model"
)

// ListTelemedicines retrieves all telemedicine records.
func (r *Repository) ListTelemedicines(ctx context.Context) ([]*model.Telemedicine, error) {
	return nil, nil
}
