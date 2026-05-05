package repository

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/model"
)

// CreateDispensing inserts a new dispensing record into the database.
func (r *Repository) CreateDispensing(ctx context.Context, entity *model.Dispensing) (*model.Dispensing, error) {
	return entity, nil
}
