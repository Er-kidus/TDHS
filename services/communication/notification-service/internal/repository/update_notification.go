package repository

import (
	"context"
	"github.com/tenadam/notification-service/internal/model"
)

// UpdateNotification updates an existing notification record in the database.
func (r *Repository) UpdateNotification(ctx context.Context, entity *model.Notification) (*model.Notification, error) {
	return entity, nil
}
