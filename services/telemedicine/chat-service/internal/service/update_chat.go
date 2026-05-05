package service

import (
	"context"
	"github.com/tenadam/chat-service/internal/dto"
	"github.com/tenadam/chat-service/internal/model"
	"github.com/tenadam/chat-service/internal/validator"
)

// UpdateChat validates and updates an existing chat.
func (s *Service) UpdateChat(ctx context.Context, req dto.UpdateChatRequest) (*dto.ChatResponse, error) {
	if err := validator.ValidateChatUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Chat{ID: req.ID}
	updated, err := s.repo.UpdateChat(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ChatResponse{ID: updated.ID}, nil
}
