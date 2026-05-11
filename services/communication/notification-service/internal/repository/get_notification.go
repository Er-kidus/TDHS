package repository

import (
	"context"
	"github.com/tenadam/notification-service/internal/model"
)

// GetNotification retrieves a single notification record by ID.
func (r *Repository) GetNotification(ctx context.Context, id string) (*model.Notification, error) {
	return nil, nil
}
