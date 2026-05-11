package repository

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/model"
)

// GetSurgeryProtocol retrieves a single surgery-protocol record by ID.
func (r *Repository) GetSurgeryProtocol(ctx context.Context, id string) (*model.SurgeryProtocol, error) {
	return nil, nil
}
