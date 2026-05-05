package service

import (
	"context"
	"github.com/tenadam/notification-service/internal/dto"
)

// GetNotification retrieves a single notification by ID.
func (s *Service) GetNotification(ctx context.Context, id string) (*dto.NotificationResponse, error) {
	entity, err := s.repo.GetNotification(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.NotificationResponse{ID: entity.ID}, nil
}
