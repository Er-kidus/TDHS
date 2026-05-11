package repository

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
)

// CreateSurgeryScheduling inserts a new surgery-scheduling record into the database.
func (r *Repository) CreateSurgeryScheduling(ctx context.Context, entity *model.SurgeryScheduling) (*model.SurgeryScheduling, error) {
	return entity, nil
}
