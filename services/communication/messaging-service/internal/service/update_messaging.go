package service

import (
	"context"
	"github.com/tenadam/messaging-service/internal/dto"
	"github.com/tenadam/messaging-service/internal/model"
	"github.com/tenadam/messaging-service/internal/validator"
)

// UpdateMessaging validates and updates an existing messaging.
func (s *Service) UpdateMessaging(ctx context.Context, req dto.UpdateMessagingRequest) (*dto.MessagingResponse, error) {
	if err := validator.ValidateMessagingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Messaging{ID: req.ID}
	updated, err := s.repo.UpdateMessaging(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MessagingResponse{ID: updated.ID}, nil
}
