package service

import (
	"context"
	"github.com/tenadam/notification-service/internal/dto"
	"github.com/tenadam/notification-service/internal/model"
	"github.com/tenadam/notification-service/internal/validator"
)

// CreateNotification validates and creates a new notification.
func (s *Service) CreateNotification(ctx context.Context, req dto.CreateNotificationRequest) (*dto.NotificationResponse, error) {
	if err := validator.ValidateNotificationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Notification{}
	created, err := s.repo.CreateNotification(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NotificationResponse{ID: created.ID}, nil
}
