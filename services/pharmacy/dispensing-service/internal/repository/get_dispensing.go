package repository

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/model"
)

// GetDispensing retrieves a single dispensing record by ID.
func (r *Repository) GetDispensing(ctx context.Context, id string) (*model.Dispensing, error) {
	return nil, nil
}
