package repository

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/model"
)

// UpdateResuscitation updates an existing resuscitation record in the database.
func (r *Repository) UpdateResuscitation(ctx context.Context, entity *model.Resuscitation) (*model.Resuscitation, error) {
	return entity, nil
}
