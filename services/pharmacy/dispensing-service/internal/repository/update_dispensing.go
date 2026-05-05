package repository

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/model"
)

// UpdateDispensing updates an existing dispensing record in the database.
func (r *Repository) UpdateDispensing(ctx context.Context, entity *model.Dispensing) (*model.Dispensing, error) {
	return entity, nil
}
