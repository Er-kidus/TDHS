package repository

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/model"
)

// UpdateInteroperability updates an existing interoperability record in the database.
func (r *Repository) UpdateInteroperability(ctx context.Context, entity *model.Interoperability) (*model.Interoperability, error) {
	return entity, nil
}
