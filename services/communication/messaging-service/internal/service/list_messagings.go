package service

import (
	"context"
	"github.com/tenadam/messaging-service/internal/dto"
)

// ListMessagings retrieves all messagings.
func (s *Service) ListMessagings(ctx context.Context) (*dto.ListMessagingResponse, error) {
	entities, err := s.repo.ListMessagings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.MessagingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.MessagingResponse{ID: e.ID})
	}
	return &dto.ListMessagingResponse{Items: items, Total: len(items)}, nil
}
