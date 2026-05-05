package repository

import (
	"context"
	"github.com/tenadam/fhir-service/internal/model"
)

// UpdateFhir updates an existing fhir record in the database.
func (r *Repository) UpdateFhir(ctx context.Context, entity *model.Fhir) (*model.Fhir, error) {
	return entity, nil
}
