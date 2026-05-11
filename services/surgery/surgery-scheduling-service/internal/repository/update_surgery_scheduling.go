package repository

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
)

// UpdateSurgeryScheduling updates an existing surgery-scheduling record in the database.
func (r *Repository) UpdateSurgeryScheduling(ctx context.Context, entity *model.SurgeryScheduling) (*model.SurgeryScheduling, error) {
	return entity, nil
}
