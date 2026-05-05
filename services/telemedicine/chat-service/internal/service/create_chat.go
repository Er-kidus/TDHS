package service

import (
	"context"
	"github.com/tenadam/chat-service/internal/dto"
	"github.com/tenadam/chat-service/internal/model"
	"github.com/tenadam/chat-service/internal/validator"
)

// CreateChat validates and creates a new chat.
func (s *Service) CreateChat(ctx context.Context, req dto.CreateChatRequest) (*dto.ChatResponse, error) {
	if err := validator.ValidateChatCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Chat{}
	created, err := s.repo.CreateChat(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ChatResponse{ID: created.ID}, nil
}
