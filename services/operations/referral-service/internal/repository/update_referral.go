package repository

import (
	"context"
	"github.com/tenadam/referral-service/internal/model"
)

// UpdateReferral updates an existing referral record in the database.
func (r *Repository) UpdateReferral(ctx context.Context, entity *model.Referral) (*model.Referral, error) {
	return entity, nil
}
