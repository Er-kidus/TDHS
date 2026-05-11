package service

import (
	"context"
	"github.com/tenadam/chat-service/internal/dto"
)

// GetChat retrieves a single chat by ID.
func (s *Service) GetChat(ctx context.Context, id string) (*dto.ChatResponse, error) {
	entity, err := s.repo.GetChat(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ChatResponse{ID: entity.ID}, nil
}
