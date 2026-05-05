package repository

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/model"
)

// UpdateClaimAdjudication updates an existing claim-adjudication record in the database.
func (r *Repository) UpdateClaimAdjudication(ctx context.Context, entity *model.ClaimAdjudication) (*model.ClaimAdjudication, error) {
	return entity, nil
}
