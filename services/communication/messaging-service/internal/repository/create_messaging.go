package repository

import (
	"context"
	"github.com/tenadam/messaging-service/internal/model"
)

// CreateMessaging inserts a new messaging record into the database.
func (r *Repository) CreateMessaging(ctx context.Context, entity *model.Messaging) (*model.Messaging, error) {
	return entity, nil
}
