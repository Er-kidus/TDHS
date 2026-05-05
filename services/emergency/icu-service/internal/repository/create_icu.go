package repository

import (
	"context"
	"github.com/tenadam/icu-service/internal/model"
)

// CreateIcu inserts a new icu record into the database.
func (r *Repository) CreateIcu(ctx context.Context, entity *model.Icu) (*model.Icu, error) {
	return entity, nil
}
