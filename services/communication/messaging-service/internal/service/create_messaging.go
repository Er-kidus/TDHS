package service

import (
	"context"
	"github.com/tenadam/messaging-service/internal/dto"
	"github.com/tenadam/messaging-service/internal/model"
	"github.com/tenadam/messaging-service/internal/validator"
)

// CreateMessaging validates and creates a new messaging.
func (s *Service) CreateMessaging(ctx context.Context, req dto.CreateMessagingRequest) (*dto.MessagingResponse, error) {
	if err := validator.ValidateMessagingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Messaging{}
	created, err := s.repo.CreateMessaging(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MessagingResponse{ID: created.ID}, nil
}
