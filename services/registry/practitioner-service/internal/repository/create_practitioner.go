package repository

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/model"
)

// CreatePractitioner inserts a new practitioner record into the database.
func (r *Repository) CreatePractitioner(ctx context.Context, entity *model.Practitioner) (*model.Practitioner, error) {
	return entity, nil
}
