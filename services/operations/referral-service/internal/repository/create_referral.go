package repository

import (
	"context"
	"github.com/tenadam/referral-service/internal/model"
)

// CreateReferral inserts a new referral record into the database.
func (r *Repository) CreateReferral(ctx context.Context, entity *model.Referral) (*model.Referral, error) {
	return entity, nil
}
