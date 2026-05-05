package repository

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
)

// GetSurgeryScheduling retrieves a single surgery-scheduling record by ID.
func (r *Repository) GetSurgeryScheduling(ctx context.Context, id string) (*model.SurgeryScheduling, error) {
	return nil, nil
}
