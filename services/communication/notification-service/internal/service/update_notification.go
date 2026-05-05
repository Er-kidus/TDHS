package service

import (
	"context"
	"github.com/tenadam/notification-service/internal/dto"
	"github.com/tenadam/notification-service/internal/model"
	"github.com/tenadam/notification-service/internal/validator"
)

// UpdateNotification validates and updates an existing notification.
func (s *Service) UpdateNotification(ctx context.Context, req dto.UpdateNotificationRequest) (*dto.NotificationResponse, error) {
	if err := validator.ValidateNotificationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Notification{ID: req.ID}
	updated, err := s.repo.UpdateNotification(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NotificationResponse{ID: updated.ID}, nil
}
