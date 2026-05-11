package repository

import (
	"context"
	"github.com/tenadam/fhir-service/internal/model"
)

// CreateFhir inserts a new fhir record into the database.
func (r *Repository) CreateFhir(ctx context.Context, entity *model.Fhir) (*model.Fhir, error) {
	return entity, nil
}
