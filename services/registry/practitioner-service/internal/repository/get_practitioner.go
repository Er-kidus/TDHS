package repository

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/model"
)

// GetPractitioner retrieves a single practitioner record by ID.
func (r *Repository) GetPractitioner(ctx context.Context, id string) (*model.Practitioner, error) {
	return nil, nil
}
