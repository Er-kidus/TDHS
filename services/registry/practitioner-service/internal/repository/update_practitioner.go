package repository

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/model"
)

// UpdatePractitioner updates an existing practitioner record in the database.
func (r *Repository) UpdatePractitioner(ctx context.Context, entity *model.Practitioner) (*model.Practitioner, error) {
	return entity, nil
}
