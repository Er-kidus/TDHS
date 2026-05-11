package repository

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/model"
)

// CreateSurgeryProtocol inserts a new surgery-protocol record into the database.
func (r *Repository) CreateSurgeryProtocol(ctx context.Context, entity *model.SurgeryProtocol) (*model.SurgeryProtocol, error) {
	return entity, nil
}
