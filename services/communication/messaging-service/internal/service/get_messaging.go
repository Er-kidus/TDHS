package service

import (
	"context"
	"github.com/tenadam/messaging-service/internal/dto"
)

// GetMessaging retrieves a single messaging by ID.
func (s *Service) GetMessaging(ctx context.Context, id string) (*dto.MessagingResponse, error) {
	entity, err := s.repo.GetMessaging(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.MessagingResponse{ID: entity.ID}, nil
}
