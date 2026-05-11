package repository

import (
	"context"
	"github.com/tenadam/referral-service/internal/model"
)

// GetReferral retrieves a single referral record by ID.
func (r *Repository) GetReferral(ctx context.Context, id string) (*model.Referral, error) {
	return nil, nil
}
