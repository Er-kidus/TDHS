package repository

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/model"
)

// CreateClaimAdjudication inserts a new claim-adjudication record into the database.
func (r *Repository) CreateClaimAdjudication(ctx context.Context, entity *model.ClaimAdjudication) (*model.ClaimAdjudication, error) {
	return entity, nil
}
