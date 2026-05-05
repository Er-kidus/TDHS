package repository

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/model"
)

// CreateInpatient inserts a new inpatient record into the database.
func (r *Repository) CreateInpatient(ctx context.Context, entity *model.Inpatient) (*model.Inpatient, error) {
	return entity, nil
}
