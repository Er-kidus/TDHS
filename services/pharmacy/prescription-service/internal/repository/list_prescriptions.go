package repository

import (
	"context"
	"github.com/tenadam/prescription-service/internal/model"
)

// ListPrescriptions retrieves all prescription records.
func (r *Repository) ListPrescriptions(ctx context.Context) ([]*model.Prescription, error) {
	return nil, nil
}
