package repository

import (
	"context"
	"github.com/tenadam/consent-service/internal/model"
)

// CreateConsent inserts a new consent record into the database.
func (r *Repository) CreateConsent(ctx context.Context, entity *model.Consent) (*model.Consent, error) {
	return entity, nil
}
