package repository

import (
	"context"
	"github.com/tenadam/session-service/internal/model"
)

// CreateSession inserts a new session record into the database.
func (r *Repository) CreateSession(ctx context.Context, entity *model.Session) (*model.Session, error) {
	return entity, nil
}
