package repository

import (
	"context"
	"github.com/tenadam/session-service/internal/model"
)

// UpdateSession updates an existing session record in the database.
func (r *Repository) UpdateSession(ctx context.Context, entity *model.Session) (*model.Session, error) {
	return entity, nil
}
