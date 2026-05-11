package repository

import (
	"context"
	"github.com/tenadam/fhir-service/internal/model"
)

// GetFhir retrieves a single fhir record by ID.
func (r *Repository) GetFhir(ctx context.Context, id string) (*model.Fhir, error) {
	return nil, nil
}
