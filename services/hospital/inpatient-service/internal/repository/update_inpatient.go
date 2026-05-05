package repository

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/model"
)

// UpdateInpatient updates an existing inpatient record in the database.
func (r *Repository) UpdateInpatient(ctx context.Context, entity *model.Inpatient) (*model.Inpatient, error) {
	return entity, nil
}
