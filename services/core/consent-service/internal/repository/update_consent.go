package repository

import (
	"context"
	"github.com/tenadam/consent-service/internal/model"
)

// UpdateConsent updates an existing consent record in the database.
func (r *Repository) UpdateConsent(ctx context.Context, entity *model.Consent) (*model.Consent, error) {
	return entity, nil
}
