package service

import (
	"context"
	"github.com/tenadam/chat-service/internal/dto"
)

// ListChats retrieves all chats.
func (s *Service) ListChats(ctx context.Context) (*dto.ListChatResponse, error) {
	entities, err := s.repo.ListChats(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ChatResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ChatResponse{ID: e.ID})
	}
	return &dto.ListChatResponse{Items: items, Total: len(items)}, nil
}
