package repository

import (
	"context"
	"github.com/tenadam/notification-service/internal/model"
)

// CreateNotification inserts a new notification record into the database.
func (r *Repository) CreateNotification(ctx context.Context, entity *model.Notification) (*model.Notification, error) {
	return entity, nil
}
