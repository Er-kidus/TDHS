package service

import (
	"context"
	"github.com/tenadam/video-session-service/internal/dto"
	"github.com/tenadam/video-session-service/internal/model"
	"github.com/tenadam/video-session-service/internal/validator"
)

// CreateVideoSession validates and creates a new video-session.
func (s *Service) CreateVideoSession(ctx context.Context, req dto.CreateVideoSessionRequest) (*dto.VideoSessionResponse, error) {
	if err := validator.ValidateVideoSessionCreate(req); err != nil {
		return nil, err
	}
	entity := &model.VideoSession{}
	created, err := s.repo.CreateVideoSession(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VideoSessionResponse{ID: created.ID}, nil
}
