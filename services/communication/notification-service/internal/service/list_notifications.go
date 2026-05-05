package service

import (
	"context"
	"github.com/tenadam/notification-service/internal/dto"
)

// ListNotifications retrieves all notifications.
func (s *Service) ListNotifications(ctx context.Context) (*dto.ListNotificationResponse, error) {
	entities, err := s.repo.ListNotifications(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.NotificationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.NotificationResponse{ID: e.ID})
	}
	return &dto.ListNotificationResponse{Items: items, Total: len(items)}, nil
}
