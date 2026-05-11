package repository

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
)

// ListSurgerySchedulings retrieves all surgery-scheduling records.
func (r *Repository) ListSurgerySchedulings(ctx context.Context) ([]*model.SurgeryScheduling, error) {
	return nil, nil
}
