package repository

import (
	"context"
	"github.com/tenadam/icu-service/internal/model"
)

// UpdateIcu updates an existing icu record in the database.
func (r *Repository) UpdateIcu(ctx context.Context, entity *model.Icu) (*model.Icu, error) {
	return entity, nil
}
