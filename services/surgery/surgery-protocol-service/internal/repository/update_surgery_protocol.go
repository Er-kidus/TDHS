package repository

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/model"
)

// UpdateSurgeryProtocol updates an existing surgery-protocol record in the database.
func (r *Repository) UpdateSurgeryProtocol(ctx context.Context, entity *model.SurgeryProtocol) (*model.SurgeryProtocol, error) {
	return entity, nil
}
